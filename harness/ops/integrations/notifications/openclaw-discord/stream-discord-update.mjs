import { STREAM_INTERVAL_MS } from "./stream-interval-ms.mjs";
import { STREAM_MAX_LENGTH } from "./stream-max-length.mjs";
import { discordStreamBuffers } from "./discord-stream-buffers.mjs";
import { flushDiscordStream } from "./flush-discord-stream.mjs";

export async function streamDiscordUpdate(
  text,
  { emoji = "🔄", timestamp = false, requestId = "default", replyTo, threadName, source } = {},
) {
  // Get or create buffer for this request (matching discord-webhook.mjs behavior)
  // Store thread/reply options with the buffer for use during flush
  if (!discordStreamBuffers.has(requestId)) {
    discordStreamBuffers.set(requestId, {
      buffer: "",
      timer: null,
      replyTo: replyTo || null,
      threadName: threadName || null,
      source: source || null,
    });
  }

  const state = discordStreamBuffers.get(requestId);

  // Accumulate text in per-request buffer
  state.buffer += text;

  // Update thread/reply options if provided
  if (replyTo) state.replyTo = replyTo;
  if (threadName) state.threadName = threadName;
  if (source) state.source = source;

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
