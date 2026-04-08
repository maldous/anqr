const threadCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX = 100;

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

export function setThreadChannelId(threadName, channelId) {
  if (!threadName || !channelId) return;
  threadCache.set(threadName, { channelId, createdAt: Date.now() });
  while (threadCache.size > CACHE_MAX) {
    const oldest = threadCache.keys().next().value;
    threadCache.delete(oldest);
  }
}
