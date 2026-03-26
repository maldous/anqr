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
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const DISCORD_WEBHOOK_ENABLED =
  process.env.DISCORD_WEBHOOK_ENABLED !== "false" && !!DISCORD_WEBHOOK_URL;

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
            logInfo(`[discord-webhook] ✅ Sent: ${payload.content?.substring(0, 50) || "embed"}`);
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
export async function sendDiscordEmbed({
  title,
  description,
  color = 0x5865f2,
  fields = [],
  footer,
}) {
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

// Streaming state for Discord updates - send in chunks every 5 seconds for proper formatting
// Per-request buffers to prevent mixing output from concurrent requests
const discordStreamBuffers = new Map(); // requestId -> { buffer: string, timer: NodeJS.Timeout | null }
const DISCORD_STREAM_INTERVAL_MS = 5000; // Send every 5 seconds to preserve formatting
const DISCORD_STREAM_MAX_LENGTH = 1900; // Leave room for prefix/suffix

/**
 * Stream a progress update to Discord with automatic batching.
 * Accumulates text and sends every 5 seconds OR when buffer exceeds 1900 chars.
 * This preserves natural formatting and prevents fragmented messages.
 *
 * Per-request buffering prevents text from concurrent requests getting mixed.
 *
 * @param {string} message
 * @param {{ emoji?: string, timestamp?: boolean, requestId?: string }} options
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function streamDiscordUpdate(message, { emoji = "🔄", timestamp = false, requestId = "default" } = {}) {
  // Get or create buffer for this request
  if (!discordStreamBuffers.has(requestId)) {
    discordStreamBuffers.set(requestId, { buffer: "", timer: null });
  }
  
  const state = discordStreamBuffers.get(requestId);
  
  // Accumulate text in per-request buffer
  state.buffer += message;

  // Send immediately if buffer exceeds max length
  if (state.buffer.length >= DISCORD_STREAM_MAX_LENGTH) {
    return await flushDiscordStream({ emoji, timestamp, requestId });
  }

  // Schedule periodic flush if not already scheduled for this request
  if (!state.timer) {
    state.timer = setTimeout(() => {
      flushDiscordStream({ emoji, timestamp, requestId }).catch(() => {
        /* ignore */
      });
    }, DISCORD_STREAM_INTERVAL_MS);
  }

  return { sent: false, reason: "buffered" };
}

/**
 * Flush accumulated Discord stream buffer immediately for a specific request.
 *
 * @param {{ emoji?: string, timestamp?: boolean, requestId?: string }} options
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function flushDiscordStream({ emoji = "🔄", timestamp = false, requestId = "default" } = {}) {
  const state = discordStreamBuffers.get(requestId);
  
  if (!state) {
    return { sent: false, reason: "no buffer for request" };
  }
  
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }

  if (state.buffer.length === 0) {
    // Clean up empty buffer
    discordStreamBuffers.delete(requestId);
    return { sent: false, reason: "empty buffer" };
  }

  const prefix = emoji ? `${emoji} ` : "";
  const suffix = timestamp ? ` (${new Date().toLocaleTimeString()})` : "";
  const maxLength = 2000 - prefix.length - suffix.length;

  let content = state.buffer;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength - 3) + "...";
  }

  // Clear buffer and remove from map
  discordStreamBuffers.delete(requestId);

  return sendDiscordMessage(prefix + content + suffix);
}
