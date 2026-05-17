import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";

const FILE_NAME = "session-state.json";

/**
 * Persist the learned context budget cap for a session so it survives
 * bridge restarts. Only shrinks the cap — never expands it — to prevent
 * stale caps from undoing adaptive learning.
 *
 * @param {string} sessionId
 * @param {number|null} cap
 */
export function saveSessionContextBudgetCap(sessionId, cap) {
  if (!sessionId || cap == null) return;

  withBridgeLock(FILE_NAME, () => {
    const state = loadSessionState();
    const session = state[sessionId];
    if (!session) return;

    // Only shrink, never expand (safety: prevent stale caps from growing back)
    if (session.contextBudgetCap == null || cap < session.contextBudgetCap) {
      session.contextBudgetCap = cap;
      saveSessionState(state);
    }
  });
}
