import { loadSessionState } from "./load-session-state.mjs";

/**
 * Read the persisted context budget cap for a session.
 * Returns null if no cap has been learned yet for this session.
 *
 * @param {string|null} sessionId
 * @returns {number|null}
 */
export function getSessionContextBudgetCap(sessionId) {
  if (!sessionId) return null;

  const state = loadSessionState();
  const session = state[sessionId];
  return session?.contextBudgetCap ?? null;
}
