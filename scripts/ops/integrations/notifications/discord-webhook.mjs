/**
 * discord-webhook.mjs — Discord Webhook Integration
 *
 * Sends notifications to Discord channel via webhook.
 * Used by Symphony/Codebuff bridges to stream responses during OpenClaw sessions.
 *
 * Environment Variables:
 *   DISCORD_WEBHOOK_URL — Discord webhook URL for notifications
 *   DISCORD_WEBHOOK_ENABLED — Enable/disable webhook (default: true if URL set)
 *
 * Usage:
 *   import { sendDiscordNotification } from './discord-webhook.mjs';
 *   
 *   sendDiscordNotification({
 *     content: "Working on your request...",
 *     embeds: [{
 *       title: "OpenClaw Update",
 *       description: "Processing...",
 *       color: 0x5865F2
 *     }]
 *   });
 */

import https from "node:https";
import { URL } from "node:url";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const DISCORD_WEBHOOK_ENABLED = process.env.DISCORD_WEBHOOK_ENABLED !== "false" && !!DISCORD_WEBHOOK_URL;

/**
 * Send a notification to Discord via webhook.
 * 
 * @param {{
 *   content?: string,
 *   embeds?: Array<{
 *     title?: string,
 *     description?: string,
 *     color?: number,
 *     fields?: Array<{ name: string, value: string, inline?: boolean }>,
 *     timestamp?: string
 *   }>,
 *   username?: string,
 *   avatar_url?: string
 * }} payload
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function sendDiscordNotification(payload) {
  if (!DISCORD_WEBHOOK_ENABLED) {
    return { sent: false, reason: "Discord webhook not enabled" };
  }

  if (!DISCORD_WEBHOOK_URL) {
    return { sent: false, reason: "DISCORD_WEBHOOK_URL not set" };
  }

  try {
    const url = new URL(DISCORD_WEBHOOK_URL);
    const postData = JSON.stringify(payload);

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
            console.error(`[discord-webhook] ✅ Sent: ${payload.content?.substring(0, 50) || "embed"}`);
            resolve({ sent: true });
          } else {
            const error = `HTTP ${res.statusCode}: ${data}`;
            console.error(`[discord-webhook] Failed: ${error}`);
            resolve({ sent: false, reason: error });
          }
        });
      });

      req.on("error", (err) => {
        console.error(`[discord-webhook] Error: ${err.message}`);
        resolve({ sent: false, reason: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        console.error(`[discord-webhook] Timeout after 10s`);
        resolve({ sent: false, reason: "Request timeout" });
      });

      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.error(`[discord-webhook] Exception: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}

/**
 * Send a simple text message to Discord.
 * 
 * @param {string} message
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function sendDiscordMessage(message) {
  return sendDiscordNotification({ content: message });
}

/**
 * Send an embedded message to Discord with formatting.
 * 
 * @param {{
 *   title: string,
 *   description?: string,
 *   color?: number,
 *   fields?: Array<{ name: string, value: string, inline?: boolean }>,
 *   footer?: string
 * }} options
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function sendDiscordEmbed({ title, description, color = 0x5865F2, fields = [], footer }) {
  const embed = {
    title,
    description,
    color,
    fields,
    timestamp: new Date().toISOString(),
  };

  if (footer) {
    embed.footer = { text: footer };
  }

  return sendDiscordNotification({
    embeds: [embed],
    username: "OpenClaw",
  });
}

/**
 * Stream a progress update to Discord.
 * Truncates long messages to fit Discord's 2000 character limit.
 * 
 * @param {string} message
 * @param {{ emoji?: string, timestamp?: boolean }} options
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function streamDiscordUpdate(message, { emoji = "🔄", timestamp = false } = {}) {
  const prefix = `${emoji} `;
  const suffix = timestamp ? ` (${new Date().toLocaleTimeString()})` : "";
  const maxLength = 2000 - prefix.length - suffix.length;
  
  let content = message;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength - 3) + "...";
  }
  
  return sendDiscordMessage(prefix + content + suffix);
}
