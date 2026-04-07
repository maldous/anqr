import { discordStreamBuffers } from "./discord-stream-buffers.mjs";
import { flushDiscordStream } from "./flush-discord-stream.mjs";

export async function finalizeDiscordStream({ emoji = "", requestId = "default" } = {}) {
  const state = discordStreamBuffers.get(requestId);
  if (!state) return { sent: false, reason: "no buffer for request" };

  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }

  // Final edit if there's unsent content
  if (state.dirty && state.fullText.length > 0) {
    await flushDiscordStream({ emoji, requestId }).catch(() => {});
  }

  discordStreamBuffers.delete(requestId);
  return { sent: true, reason: "finalized" };
}
