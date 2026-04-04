// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:208

import { SESSION_TTL_MS } from "./session-ttl-ms.mjs";
import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { logInfo } from "./logger.mjs";

export function cleanupExpiredSessions() {
  const state = loadSessionState();
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of Object.entries(state)) {
    const age = now - session.lastUsed;
    if (age > SESSION_TTL_MS) {
      delete state[sessionId];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    saveSessionState(state);
    logInfo(`[session-state] 🧹 Cleaned up ${cleaned} expired sessions`);
  }

  return cleaned;
}
