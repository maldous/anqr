import { DISCORD_TEXT_CHANNEL_ID } from "./discord-text-channel-id.mjs";
import { invokeGateway } from "./invoke-gateway.mjs";
import { getThreadChannelId, setThreadChannelId } from "./discord-thread-cache.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function createDiscordThread(messageId, threadName) {
  if (!messageId || !threadName) {
    return { created: false, reason: "missing messageId or threadName" };
  }

  // Check cache first — avoid duplicate thread creation across concurrent
  // requests that share the same threadName.
  const existingThreadId = getThreadChannelId(threadName);
  if (existingThreadId) {
    logDebug(`Thread already cached for "${threadName}" → ${existingThreadId}, skipping creation`);
    return { created: false, threadChannelId: existingThreadId, reason: "already cached" };
  }

  logDebug(`Creating Discord thread: "${threadName}" on message ${messageId}`);

  const result = await invokeGateway("message", {
    action: "thread-create",
    channel: "discord",
    to: DISCORD_TEXT_CHANNEL_ID,
    threadName,
    messageId,
  });

  if (!result.ok) {
    logWarn(`Thread creation failed: ${result.reason}`);
    return { created: false, reason: result.reason };
  }

  const threadChannelId =
    result.result?.thread?.id ||
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
