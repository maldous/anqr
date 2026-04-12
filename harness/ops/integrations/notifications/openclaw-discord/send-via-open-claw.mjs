import { DISCORD_TEXT_CHANNEL_ID } from "./discord-text-channel-id.mjs";
import { getThreadChannelId } from "./discord-thread-cache.mjs";
import { invokeGateway } from "./invoke-gateway.mjs";
import { logDebug } from "./logger.mjs";

export async function sendViaOpenClaw(content, options = {}) {
  const isEdit = Boolean(options.messageId);

  // Determine target channel:
  // - Edits always target the main channel (thread starter lives in parent)
  // - New sends route to cached thread if available
  let targetChannel = DISCORD_TEXT_CHANNEL_ID;
  if (!isEdit && options.threadName) {
    const cached = getThreadChannelId(options.threadName);
    if (cached) {
      targetChannel = cached;
      logDebug(`Routing send to cached thread: ${options.threadName} → ${cached}`);
    }
  }
  if (options.toChannel) {
    targetChannel = options.toChannel;
  }

  const messageArgs = {
    action: isEdit ? "edit" : "send",
    message: content,
    channel: "discord",
    to: targetChannel,
  };

  if (options.messageId) {
    messageArgs.messageId = options.messageId;
  }
  if (options.replyTo) {
    messageArgs.replyTo = options.replyTo;
  }

  const result = await invokeGateway("message", messageArgs);

  if (!result.ok) {
    return { sent: false, reason: result.reason };
  }

  const messageId = result.result?.messageId || result.result?.id || null;

  logDebug(
    `Discord ${messageArgs.action}: messageId=${messageId || "(none)"} to=${targetChannel} len=${content.length}`,
  );

  return { sent: true, messageId };
}

export async function deleteViaOpenClaw(messageId) {
  if (!messageId) return { deleted: false, reason: "no messageId" };

  const result = await invokeGateway("message", {
    action: "delete",
    channel: "discord",
    to: DISCORD_TEXT_CHANNEL_ID,
    messageId,
  });

  return result.ok ? { deleted: true } : { deleted: false, reason: result.reason };
}
