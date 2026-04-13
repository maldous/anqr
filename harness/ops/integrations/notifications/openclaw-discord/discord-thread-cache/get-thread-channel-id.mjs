import { threadCache, CACHE_TTL_MS } from "./thread-cache-instance.mjs";

export function getThreadChannelId(threadName) {
  if (!threadName) return null;
  const entry = threadCache.get(threadName);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    threadCache.delete(threadName);
    return null;
  }
  return entry.channelId;
}
