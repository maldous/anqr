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

  // Serialize flushes — each caller chains onto the previous so that
  // state.messageId is always set before the next flush runs.
  const prev = state._flushPromise || Promise.resolve();
  let resolveLock;
  state._flushPromise = new Promise((r) => {
    resolveLock = r;
  });
  await prev;

  try {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }

    if (!state.dirty || state.fullText.length === 0) {
      return { sent: false, reason: "no new content" };
    }

    const prefix = emoji ? `${emoji} ` : "";
    const suffix = timestamp ? ` (${new Date().toLocaleTimeString()})` : "";
    const maxLength = 2000 - prefix.length - suffix.length;

    let content = state.fullText;
    if (content.length > maxLength) {
      content = "\u2026" + content.substring(content.length - maxLength + 1);
    }

    const message = prefix + content + suffix;

    if (state.messageId) {
      // Await the edit so the lock serializes the full HTTP round-trip,
      // preventing out-of-order edits and stale-overwrite races.
      const editResult = await sendViaOpenClaw(message, {
        messageId: state.messageId,
        replyTo: state.replyTo,
        source: state.source,
      });
      if (editResult.sent) state.dirty = false;
      return editResult;
    }

    // First flush — send new message to parent channel and capture ID.
    // Don't pass threadName — streaming previews always go to the parent
    // channel so edits and deletes target the correct location.
    const result = await sendViaOpenClaw(message, {
      replyTo: state.replyTo,
      source: state.source,
    });

    if (result.sent) state.dirty = false;

    if (result.messageId) {
      state.messageId = result.messageId;

      // Fire-and-forget thread creation — don't block the streaming preview.
      // Use _threadPromise as a once-only gate (set synchronously so no race).
      if (state.threadName && !state._threadPromise) {
        state._threadPromise = createDiscordThread(result.messageId, state.threadName)
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
  } finally {
    resolveLock();
  }
}
