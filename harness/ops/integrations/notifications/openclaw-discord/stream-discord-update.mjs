import { STREAM_INTERVAL_MS } from "./stream-interval-ms.mjs";
import { discordStreamBuffers } from "./discord-stream-buffers.mjs";
import { flushDiscordStream } from "./flush-discord-stream.mjs";

export async function streamDiscordUpdate(
  text,
  { emoji = "", timestamp = false, requestId = "default", replyTo, threadName, source } = {},
) {
  if (!discordStreamBuffers.has(requestId)) {
    discordStreamBuffers.set(requestId, {
      fullText: "",
      dirty: false,
      messageId: null,
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

  // Schedule periodic flush if not already scheduled
  if (!state.timer) {
    state.timer = setTimeout(() => {
      flushDiscordStream({ emoji, timestamp, requestId }).catch(() => {});
    }, STREAM_INTERVAL_MS);
  }

  return { sent: false, reason: "buffered" };
}
