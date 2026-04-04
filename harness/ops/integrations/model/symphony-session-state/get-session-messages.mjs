// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:283

import { loadSessionState } from "./load-session-state.mjs";

export function getSessionMessages(sessionId) {
  if (!sessionId) return null;

  const state = loadSessionState();
  const session = state[sessionId];
  if (!session || !session.messages) {
    return null;
  }

  // Return a deep copy to prevent external mutation
  return structuredClone(session.messages);
}
