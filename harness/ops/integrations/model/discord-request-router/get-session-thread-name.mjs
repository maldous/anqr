import { evictExpiredSessions } from "./evict-expired-sessions.mjs";
import { generateThreadName } from "./generate-thread-name.mjs";
import { sessionThreadNames } from "./session-thread-names.mjs";

export function getSessionThreadName(sessionId, messages) {
  // Periodic eviction (cheap — runs inline)
  if (sessionThreadNames.size > 50) evictExpiredSessions();

  if (sessionId && sessionThreadNames.has(sessionId)) {
    const existing = sessionThreadNames.get(sessionId);
    sessionThreadNames.set(sessionId, { ...existing, createdAt: Date.now() });
    if (existing?.threadName) return existing.threadName;
  }

  const threadName = generateThreadName(messages);
  if (threadName && sessionId) {
    const existing = sessionThreadNames.get(sessionId) || {};
    sessionThreadNames.set(sessionId, { ...existing, threadName, createdAt: Date.now() });
  }
  return threadName;
}
