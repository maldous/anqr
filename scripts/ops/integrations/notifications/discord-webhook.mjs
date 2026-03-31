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

function trimToUndefined(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeDiscordEmbed(embed = {}) {
  const title = trimToUndefined(embed.title);
  const description = trimToUndefined(embed.description);
  const fields = Array.isArray(embed.fields)
    ? embed.fields
        .map((field) => ({
          name: trimToUndefined(field?.name),
          value: trimToUndefined(field?.value),
          inline: Boolean(field?.inline),
        }))
        .filter((field) => field.name && field.value)
    : [];

  if (!title && !description && fields.length === 0) return null;

  const sanitized = { ...embed };
  if (title) sanitized.title = title;
  else delete sanitized.title;
  if (description) sanitized.description = description;
  else delete sanitized.description;
  if (fields.length > 0) sanitized.fields = fields;
  else delete sanitized.fields;
  return sanitized;
}

function sanitizeDiscordPayload(payload = {}) {
  const content = trimToUndefined(payload.content);
  const embeds = Array.isArray(payload.embeds)
    ? payload.embeds.map(sanitizeDiscordEmbed).filter(Boolean)
    : [];

  if (!content && embeds.length === 0) return null;

  const sanitized = { ...payload };
  if (content) sanitized.content = content;
  else delete sanitized.content;
  if (embeds.length > 0) sanitized.embeds = embeds;
  else delete sanitized.embeds;
  return sanitized;
}

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
    const sanitizedPayload = sanitizeDiscordPayload(payload);
    if (!sanitizedPayload) {
      logWarn(`[discord-webhook] Skipping empty payload`);
      return { sent: false, reason: "empty payload" };
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

/**
 * Send a simple text message to Discord.
 *
 * @param {string} message
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function sendDiscordMessage(message) {
  const content = trimToUndefined(message);
  if (!content) return { sent: false, reason: "empty message" };
  return sendDiscordNotification({ content });
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
    title: trimToUndefined(title),
    description: trimToUndefined(description),
    color,
    fields: Array.isArray(fields) ? fields : [],
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

// Streaming state for Discord updates - send in chunks every 1 second for responsive streaming
// Per-request buffers to prevent mixing output from concurrent requests
const discordStreamBuffers = new Map(); // requestId -> { buffer: string, timer: NodeJS.Timeout | null }
const DISCORD_STREAM_INTERVAL_MS = 1000; // Send every 1 second for responsive streaming
const DISCORD_STREAM_MAX_LENGTH = 1900; // Leave room for prefix/suffix

/**
 * Stream a progress update to Discord with automatic batching.
 * Accumulates text and sends every 1 second OR when buffer exceeds 1900 chars.
 * This provides responsive streaming while preserving formatting and preventing fragmented messages.
 *
 * Per-request buffering prevents text from concurrent requests getting mixed.
 *
 * @param {string} message
 * @param {{ emoji?: string, timestamp?: boolean, requestId?: string }} options
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function streamDiscordUpdate(
  message,
  { emoji = "🔄", timestamp = false, requestId = "default" } = {},
) {
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
export async function flushDiscordStream({
  emoji = "🔄",
  timestamp = false,
  requestId = "default",
} = {}) {
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
