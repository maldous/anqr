// Generated from ../../../../scripts/ops/integrations/notifications/discord-webhook.mjs:104

import { URL } from "node:url";
import https from "node:https";

import { DISCORD_WEBHOOK_ENABLED } from "./discord-webhook-enabled.mjs";
import { DISCORD_WEBHOOK_URL } from "./discord-webhook-url.mjs";
import { sanitizeDiscordPayload } from "./sanitize-discord-payload.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function sendDiscordNotification(payload) {
  if (!DISCORD_WEBHOOK_ENABLED) {
    return { sent: false, reason: "Discord webhook not enabled" };
  }

  if (!DISCORD_WEBHOOK_URL) {
    return { sent: false, reason: "DISCORD_WEBHOOK_URL not set" };
  }

  try {
    const sanitizedPayload = sanitizeDiscordPayload(payload);
    if (!sanitizedPayload) {
      logWarn(`[discord-webhook] Skipping empty payload`);
      return { sent: false, reason: "empty payload" };
    }

    // Add message reference for thread replies (Discord requests)
    if (payload.message_reference) {
      sanitizedPayload.message_reference = payload.message_reference;
    }

    // Add thread name for Linear webhook requests
    if (payload.thread_name) {
      sanitizedPayload.thread_name = payload.thread_name;
    }

    const url = new URL(DISCORD_WEBHOOK_URL);
    const postData = JSON.stringify(sanitizedPayload);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "User-Agent": "OpenClaw-Discord-Webhook/1.0",
      },
      timeout: 10000,
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            logInfo(
              `[discord-webhook] ✅ Sent: ${sanitizedPayload.content?.substring(0, 50) || "embed"}`,
            );
            resolve({ sent: true });
          } else {
            const error = `HTTP ${res.statusCode}: ${data}`;
            logError(`[discord-webhook] Failed: ${error}`);
            resolve({ sent: false, reason: error });
          }
        });
      });

      req.on("error", (err) => {
        logError(`[discord-webhook] Error: ${err.message}`);
        resolve({ sent: false, reason: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        logWarn(`[discord-webhook] Timeout after 10s`);
        resolve({ sent: false, reason: "Request timeout" });
      });

      req.write(postData);
      req.end();
    });
  } catch (err) {
    logError(`[discord-webhook] Exception: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}
