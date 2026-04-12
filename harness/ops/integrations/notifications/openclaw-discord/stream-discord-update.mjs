import { STREAM_INTERVAL_MS } from "./stream-interval-ms.mjs";
import { discordStreamBuffers } from "./discord-stream-buffers.mjs";
import { flushDiscordStream } from "./flush-discord-stream.mjs";
import { logWarn } from "./logger.mjs";

const STREAM_FIRST_FLUSH_CHARS = 80;

export async function streamDiscordUpdate(
  text,
  { emoji = "", timestamp = false, requestId = "default", replyTo, threadName, source } = {},
) {
  if (!discordStreamBuffers.has(requestId)) {
    discordStreamBuffers.set(requestId, {
      fullText: "",
      dirty: false,
      messageId: null,
      threadChannelId: null,
      _eagerFlushing: false,
      _flushPromise: null,
      _threadPromise: null,
      createdAt: Date.now(),
      timer: null,
      replyTo: replyTo || null,
      threadName: threadName || null,
      source: source || null,
    });
  }

  const state = discordStreamBuffers.get(requestId);
  state.fullText += text;
  state.dirty = true;

  if (replyTo) state.replyTo = replyTo;
  if (threadName) state.threadName = threadName;
  if (source) state.source = source;

  // Eager first flush — get the initial message up quickly so Discord shows content.
  // The _eagerFlushing lock prevents concurrent first-flushes when onChunk fires
  // synchronously for buffered providers (hundreds of chunks before the first HTTP
  // round-trip completes and sets state.messageId).
  if (
    !state.messageId &&
    !state._eagerFlushing &&
    state.fullText.length >= STREAM_FIRST_FLUSH_CHARS
  ) {
    state._eagerFlushing = true;
    try {
      return await flushDiscordStream({ emoji, timestamp, requestId });
    } finally {
      state._eagerFlushing = false;
    }
  }

  // Schedule periodic flush if not already scheduled
  if (!state.timer) {
    state.timer = setTimeout(() => {
      flushDiscordStream({ emoji, timestamp, requestId }).catch((err) => {
        logWarn(`Periodic flush failed: ${err.message}`);
      });
    }, STREAM_INTERVAL_MS);
  }

  return { sent: false, reason: "buffered" };
}
