import http from "node:http";

import { DISCORD_TEXT_CHANNEL_ID } from "./discord-text-channel-id.mjs";
import { OPENCLAW_GATEWAY_HOST } from "./openclaw-gateway-host.mjs";
import { OPENCLAW_GATEWAY_PORT } from "./openclaw-gateway-port.mjs";
import { OPENCLAW_GATEWAY_TOKEN } from "./openclaw-gateway-token.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function sendViaOpenClaw(content, options = {}) {
  // If no token is configured, return failure (graceful degradation)
  if (!OPENCLAW_GATEWAY_TOKEN) {
    return { sent: false, reason: "OPENCLAW_GATEWAY_TOKEN not set" };
  }

  // Build message args
  const messageArgs = {
    action: options.messageId ? "edit" : "send",
    message: content,
    channel: "discord",
    to: DISCORD_TEXT_CHANNEL_ID,
  };

  if (options.messageId) {
    messageArgs.messageId = options.messageId;
  }

  // Add thread/reply options (source-agnostic)
  if (options.threadName) {
    messageArgs.threadName = options.threadName;
    logDebug(`Discord thread: ${options.threadName}`);
  }
  if (options.replyTo) {
    messageArgs.replyTo = options.replyTo;
    logDebug(`Discord reply to message: ${options.replyTo}`);
  }

  // Use OpenClaw Gateway's tools/invoke API with message tool
  // Explicitly target the Discord text channel for notifications
  const requestBody = JSON.stringify({
    tool: "message",
    args: messageArgs,
  });

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
          logDebug(`OpenClaw Discord message sent: "${content.slice(0, 50)}..."`);
          let messageId = null;
          try {
            const parsed = JSON.parse(data);
            messageId = parsed.messageId || parsed.id || parsed.result?.messageId || null;
          } catch {}
          resolve({ sent: true, messageId });
        } else {
          logWarn(`OpenClaw Discord failed: ${res.statusCode} ${data.slice(0, 100)}`);
          resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on("error", (err) => {
      logWarn(`OpenClaw Discord error: ${err.message}`);
      resolve({ sent: false, reason: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ sent: false, reason: "timeout" });
    });

    req.write(requestBody);
    req.end();
  });
}
