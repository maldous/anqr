import http from "node:http";

import { OPENCLAW_GATEWAY_HOST } from "./openclaw-gateway-host.mjs";
import { OPENCLAW_GATEWAY_PORT } from "./openclaw-gateway-port.mjs";
import { OPENCLAW_GATEWAY_TOKEN } from "./openclaw-gateway-token.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function invokeGateway(toolName, args) {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    logWarn(`Gateway ${toolName}: OPENCLAW_GATEWAY_TOKEN not set — skipping`);
    return { ok: false, reason: "OPENCLAW_GATEWAY_TOKEN not set" };
  }

  const requestBody = JSON.stringify({ tool: toolName, args });

  const httpOptions = {
    hostname: OPENCLAW_GATEWAY_HOST,
    port: OPENCLAW_GATEWAY_PORT,
    path: "/tools/invoke",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
      Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
    },
    timeout: 15000,
  };

  return new Promise((resolve) => {
    const req = http.request(httpOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {}
          // Unwrap OpenClaw content wrapper:
          // Gateway returns {result: {content: [{type:"text", text:"{\"ok\":true,\"result\":{\"messageId\":\"...\"}}"}]}}
          let innerResult = parsed?.result ?? parsed ?? null;
          if (innerResult?.content?.[0]?.text) {
            try {
              const unwrapped = JSON.parse(innerResult.content[0].text);
              innerResult = unwrapped?.result ?? unwrapped;
            } catch {}
          }
          // Check for logical failure inside 200 OK (gateway can return
          // success HTTP status with an error payload in the body).
          if (innerResult?.ok === false || innerResult?.error) {
            const errorMsg = innerResult?.error?.message || "logical failure in 200 response";
            logWarn(
              `Gateway ${toolName}/${args.action || ""}: logical failure — ${errorMsg}`,
            );
            resolve({ ok: false, reason: errorMsg, result: innerResult, raw: data });
            return;
          }
          logDebug(
            `Gateway ${toolName}/${args.action || ""}: OK — ${JSON.stringify(innerResult).slice(0, 120)}`,
          );
          resolve({ ok: true, result: innerResult, raw: data });
        } else {
          logWarn(
            `Gateway ${toolName}/${args.action || ""}: HTTP ${res.statusCode} — ${data.slice(0, 150)}`,
          );
          resolve({ ok: false, reason: `HTTP ${res.statusCode}`, raw: data });
        }
      });
    });

    req.on("error", (err) => {
      logWarn(`Gateway ${toolName} error: ${err.message}`);
      resolve({ ok: false, reason: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, reason: "timeout" });
    });

    req.write(requestBody);
    req.end();
  });
}
