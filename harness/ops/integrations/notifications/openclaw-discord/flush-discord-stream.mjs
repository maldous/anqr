import { createDiscordThread } from "./create-discord-thread.mjs";
import { discordStreamBuffers } from "./discord-stream-buffers.mjs";
import { sendViaOpenClaw } from "./send-via-open-claw.mjs";
import { logWarn } from "./logger.mjs";

export async function flushDiscordStream({
  emoji = "",
  timestamp = false,
  requestId = "default",
} = {}) {
  const state = discordStreamBuffers.get(requestId);
  if (!state) return { sent: false, reason: "no buffer for request" };

  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }

  if (!state.dirty || state.fullText.length === 0) {
    return { sent: false, reason: "no new content" };
  }

  state.dirty = false;

  const prefix = emoji ? `${emoji} ` : "";
  const suffix = timestamp ? ` (${new Date().toLocaleTimeString()})` : "";
  const maxLength = 2000 - prefix.length - suffix.length;

  let content = state.fullText;
  if (content.length > maxLength) {
    content = "\u2026" + content.substring(content.length - maxLength + 1);
  }

  const message = prefix + content + suffix;

  if (state.messageId) {
    return sendViaOpenClaw(message, {
      messageId: state.messageId,
      replyTo: state.replyTo,
      threadName: state.threadName,
      source: state.source,
    });
  }

  // First flush — send new message and capture ID for future edits
  const result = await sendViaOpenClaw(message, {
    replyTo: state.replyTo,
    threadName: state.threadName,
    source: state.source,
  });

  if (result.messageId) {
    state.messageId = result.messageId;

    // Fire-and-forget thread creation — don't block the streaming preview.
    // The thread cache is updated asynchronously so subsequent embeds
    // route to the thread once it's ready. Only create once per stream.
    if (state.threadName && !state.threadChannelId) {
      createDiscordThread(result.messageId, state.threadName)
        .then((thread) => {
          if (thread.threadChannelId) {
            state.threadChannelId = thread.threadChannelId;
          }
        })
        .catch((err) => {
          logWarn(`Thread creation failed: ${err.message}`);
        });
    }
  }

  return result;
}
