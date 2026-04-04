// Generated from ../../../../scripts/ops/integrations/notifications/discord-webhook.mjs:338

import { discordStreamBuffers } from "./discord-stream-buffers.mjs";
import { sendDiscordMessage } from "./send-discord-message.mjs";

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

  // Use thread/reply options stored with the buffer
  return sendDiscordMessage(prefix + content + suffix, {
    replyTo: state.replyTo,
    threadName: state.threadName,
    source: state.source,
  });
}
