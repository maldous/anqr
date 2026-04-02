#!/usr/bin/env node

/**
 * openclaw-discord.mjs - Send Discord messages via OpenClaw Gateway
 *
 * Instead of using a Discord webhook directly, this module routes messages
 * through OpenClaw Gateway's Responses API (/v1/chat/completions), which uses
 * the Discord bot with session-aware channel behavior.
 *
 * This ensures OpenClaw owns the Discord bot integration, and Symphony does not
 * talk to Discord directly.
 *
 * API: Uses /v1/chat/completions for session-aware replies. Use /tools/invoke only
 * for explicit one-off tool actions.
 *
 * Usage:
 *   import { sendDiscordMessage, sendDiscordEmbed, streamDiscordUpdate } from './openclaw-discord.mjs';
 *
 * Environment:
 *   OPENCLAW_GATEWAY_HOST - Host for OpenClaw Gateway (default: 127.0.0.1)
 *   OPENCLAW_GATEWAY_PORT - Port for OpenClaw Gateway (default: 18789)
 *   OPENCLAW_GATEWAY_TOKEN - Token for OpenClaw Gateway authentication
 *   DISCORD_TEXT_CHANNEL_ID - Discord text channel for notifications
 *
 * API: Uses OpenClaw Gateway's Responses API (/v1/chat/completions) for session-aware
 * Discord replies. This preserves channel/session behavior configured in OpenClaw.
 * Use /tools/invoke only for explicit one-off tool actions.
 */

import http from "node:http";
import { createLogger } from "../../lib/logger.mjs";

const { logDebug, logWarn } = createLogger();

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_HOST = process.env.OPENCLAW_GATEWAY_HOST || "127.0.0.1";
const OPENCLAW_GATEWAY_PORT = Number.parseInt(process.env.OPENCLAW_GATEWAY_PORT || "18789", 10);
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || null;
const DISCORD_TEXT_CHANNEL_ID = process.env.DISCORD_TEXT_CHANNEL_ID || "1486262758256410646";

// Per-request streaming buffers - prevents mixing output from concurrent requests
// Each requestId gets its own buffer, matching the behavior of discord-webhook.mjs
const discordStreamBuffers = new Map(); // requestId -> { buffer: string, timer: NodeJS.Timeout | null }

// Streaming configuration (matching discord-webhook.mjs behavior)
const STREAM_INTERVAL_MS = 1000; // Send every 1 second for responsive streaming
const STREAM_MAX_LENGTH = 1900; // Leave room for prefix/suffix

/**
 * Send a message to Discord via OpenClaw Gateway's tools/invoke API
 * Uses the message tool to send messages to the Discord text channel.
 * @param {string} content - Message content to send
 * @returns {Promise<{sent: boolean, reason?: string}>}
 */
async function sendViaOpenClaw(content) {
  // If no token is configured, return failure (graceful degradation)
  if (!OPENCLAW_GATEWAY_TOKEN) {
    return { sent: false, reason: "OPENCLAW_GATEWAY_TOKEN not set" };
  }

  // Use OpenClaw Gateway's tools/invoke API with message tool
  // Explicitly target the Discord text channel for notifications
  const requestBody = JSON.stringify({
    tool: "message",
    args: {
      action: "send",
      message: content,
      channel: "discord",
      to: DISCORD_TEXT_CHANNEL_ID,
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
      "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
    },
    timeout: 15000,
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          logDebug(`OpenClaw Discord message sent: "${content.slice(0, 50)}..."`);
          resolve({ sent: true });
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

/**
 * Send a simple text message to Discord
 * @param {string} content - Message content
 * @returns {Promise<{sent: boolean, reason?: string}>}
 */
export async function sendDiscordMessage(content) {
  if (!content || !content.trim()) {
    return { sent: false, reason: "empty content" };
  }
  return sendViaOpenClaw(content);
}

/**
 * Send an embedded message to Discord
 * @param {Object} options - Embed options
 * @param {string} options.title - Embed title
 * @param {string} options.description - Embed description
 * @param {number} options.color - Embed color (hex)
 * @param {Array} options.fields - Embed fields
 * @param {string} options.footer - Embed footer
 * @returns {Promise<{sent: boolean, reason?: string}>}
 */
export async function sendDiscordEmbed({ title, description, fields, footer }) {
  // Build embed as a formatted text message since OpenClaw's message tool
  // sends plain text. We format it nicely for Discord.
  let content = "";

  if (title) {
    content += `**${title}**\n\n`;
  }

  if (description) {
    content += `${description}\n\n`;
  }

  if (fields && fields.length > 0) {
    for (const field of fields) {
      content += `**${field.name}**: ${field.value}`;
      if (!field.inline) content += "\n";
      content += "\n";
    }
  }

  if (footer) {
    const timestamp = new Date().toISOString();
    content += `\n_${footer} (${timestamp})_`;
  }

  if (!content.trim()) {
    return { sent: false, reason: "empty embed" };
  }

  return sendViaOpenClaw(content.trim());
}

/**
 * Stream a text update to Discord with automatic batching.
 * Accumulates text and sends every 1 second OR when buffer exceeds 1900 chars.
 * Per-request buffering prevents text from concurrent requests getting mixed.
 *
 * @param {string} text - Text to stream
 * @param {Object} options - Stream options
 * @param {string} options.emoji - Emoji prefix (default: 🔄)
 * @param {boolean} options.timestamp - Include timestamp in message
 * @param {string} options.requestId - Request ID for tracking (default: "default")
 * @returns {Promise<{sent: boolean, reason?: string}>}
 */
export async function streamDiscordUpdate(
  text,
  { emoji = "🔄", timestamp = false, requestId = "default" } = {},
) {
  // Get or create buffer for this request (matching discord-webhook.mjs behavior)
  if (!discordStreamBuffers.has(requestId)) {
    discordStreamBuffers.set(requestId, { buffer: "", timer: null });
  }

  const state = discordStreamBuffers.get(requestId);

  // Accumulate text in per-request buffer
  state.buffer += text;

  // Send immediately if buffer exceeds max length (matching discord-webhook.mjs)
  if (state.buffer.length >= STREAM_MAX_LENGTH) {
    return await flushDiscordStream({ emoji, timestamp, requestId });
  }

  // Schedule periodic flush if not already scheduled for this request
  if (!state.timer) {
    state.timer = setTimeout(() => {
      flushDiscordStream({ emoji, timestamp, requestId }).catch(() => {
        /* ignore */
      });
    }, STREAM_INTERVAL_MS);
  }

  return { sent: false, reason: "buffered" };
}

/**
 * Flush accumulated Discord stream buffer immediately for a specific request.
 *
 * @param {Object} options - Flush options
 * @param {string} options.emoji - Emoji prefix (default: 🔄)
 * @param {boolean} options.timestamp - Include timestamp
 * @param {string} options.requestId - Request ID to flush (default: "default")
 * @returns {Promise<{sent: boolean, reason?: string}>}
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

  return sendViaOpenClaw(prefix + content + suffix);
}

/**
 * Check if OpenClaw Gateway is available
 * @returns {Promise<boolean>}
 */
export async function isOpenClawAvailable() {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    return false;
  }

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: OPENCLAW_GATEWAY_HOST,
        port: OPENCLAW_GATEWAY_PORT,
        path: "/health",
        method: "GET",
        timeout: 3000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      },
    );

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}