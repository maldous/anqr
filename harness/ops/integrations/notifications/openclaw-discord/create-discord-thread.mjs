import { DISCORD_TEXT_CHANNEL_ID } from "./discord-text-channel-id.mjs";
import { invokeGateway } from "./invoke-gateway.mjs";
import { setThreadChannelId } from "./discord-thread-cache.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function createDiscordThread(messageId, threadName) {
  if (!messageId || !threadName) {
    return { created: false, reason: "missing messageId or threadName" };
  }

  logDebug(`Creating Discord thread: "${threadName}" on message ${messageId}`);

  const result = await invokeGateway("message", {
    action: "thread-create",
    channel: "discord",
    to: DISCORD_TEXT_CHANNEL_ID,
    name: threadName,
    messageId,
  });

  if (!result.ok) {
    logWarn(`Thread creation failed: ${result.reason}`);
    return { created: false, reason: result.reason };
  }

  const threadChannelId =
    result.result?.channelId ||
    result.result?.threadId ||
    result.result?.id ||
    null;

  if (threadChannelId) {
    logDebug(`Thread created: "${threadName}" → channel ${threadChannelId}`);
    setThreadChannelId(threadName, threadChannelId);
    return { created: true, threadChannelId };
  }

  logWarn(`Thread creation returned no channel ID: ${JSON.stringify(result.result).slice(0, 150)}`);
  return { created: false, reason: "no channel ID in response" };
}
