// Generated from ../../../../scripts/ops/integrations/notifications/test-discord.mjs:38

import http from "node:http";

import { OPENCLAW_GATEWAY_HOST } from "./openclaw-gateway-host.mjs";
import { OPENCLAW_GATEWAY_PORT } from "./openclaw-gateway-port.mjs";
import { OPENCLAW_GATEWAY_TOKEN } from "./openclaw-gateway-token.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function testVoiceAnnouncement(text) {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    logInfo("❌ Voice test skipped: OPENCLAW_GATEWAY_TOKEN not set");
    logInfo("   💡 Voice requires OpenClaw Gateway configuration (external service)");
    return { sent: false, reason: "OPENCLAW_GATEWAY_TOKEN not set" };
  }

  try {
    const requestBody = JSON.stringify({
      tool: "message",
      args: {
        action: "send",
        message: text,
        channel: "discord",
        to: "1486262758256410647", // Voice channel
      },
    });

    const options = {
      hostname: OPENCLAW_GATEWAY_HOST,
      port: OPENCLAW_GATEWAY_PORT,
      path: "/tools/invoke",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
        Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      timeout: 10000,
    };

    return new Promise((resolve, _reject) => {
      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            logInfo(`✅ Voice announcement sent: "${text}"`);
            resolve({ sent: true });
          } else {
            logError(`❌ Voice announcement failed: ${res.statusCode} ${data}`);
            logError(`   💡 This indicates OpenClaw Gateway received the request but voice failed`);
            logError(`   📚 Check Discord bot permissions, intents, and voice dependencies`);
            logError(`   📖 See docs/harness/discord-voice-integration.md for details`);
            resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
          }
        });
      });

      req.on("error", (err) => {
        logError(`❌ Voice announcement error: ${err.message}`);
        logError(`   💡 Check OpenClaw Gateway is running and Discord bot is configured`);
        logError(`   📚 See docs/harness/discord-voice-integration.md for troubleshooting`);
        resolve({ sent: false, reason: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        logWarn(`❌ Voice announcement timeout`);
        resolve({ sent: false, reason: "timeout" });
      });

      req.write(requestBody);
      req.end();
    });
  } catch (err) {
    logError(`❌ Voice announcement exception: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}
