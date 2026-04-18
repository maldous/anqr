import { SESSION_TTL_MS } from "./session-ttl-ms.mjs";
import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";

const FILE_NAME = "session-state.json";

export function getSessionProvider(sessionId) {
  if (!sessionId) return null;

  // Read-modify-write (delete expired + save) must be atomic under lock.
  return withBridgeLock(FILE_NAME, () => {
    const state = loadSessionState();
    const session = state[sessionId];

    if (!session) return null;

    // Check TTL
    const age = Date.now() - session.lastUsed;
    if (age > SESSION_TTL_MS) {
      delete state[sessionId];
      saveSessionState(state);
      return null;
    }

    return session;
  });
}
