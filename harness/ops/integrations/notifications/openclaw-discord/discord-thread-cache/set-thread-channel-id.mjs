import { threadCache } from "./thread-cache-instance.mjs";

export function setThreadChannelId(threadName, channelId) {
  if (!threadName || !channelId) return;
  threadCache.set(threadName, { channelId, createdAt: Date.now() });
}
