import { evictExpiredSessions } from "./evict-expired-sessions.mjs";
import { generateThreadName } from "./generate-thread-name.mjs";
import { sessionThreadNames } from "./session-thread-names.mjs";

export function getSessionThreadName(sessionId, messages) {
  // Periodic eviction (cheap — runs inline)
  if (sessionThreadNames.size > 50) evictExpiredSessions();

  if (sessionId && sessionThreadNames.has(sessionId)) {
    return sessionThreadNames.get(sessionId).threadName;
  }

  const threadName = generateThreadName(messages);
  if (threadName && sessionId) {
    sessionThreadNames.set(sessionId, { threadName, createdAt: Date.now() });
  }
  return threadName;
}
