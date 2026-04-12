import { createDurableMap } from "../../../lib/durable-kv.mjs";

const threadCache = createDurableMap("discord-thread-cache");
const CACHE_TTL_MS = 30 * 60 * 1000;

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
}
