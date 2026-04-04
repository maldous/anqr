// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:328

import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { logDebug } from "./logger.mjs";

export function clearSessionMessages(sessionId) {
  if (!sessionId) return;

  const state = loadSessionState();
  const session = state[sessionId];
  if (session) {
    delete session.messages;
    delete session.messageHash;
    saveSessionState(state);
    logDebug(`[session-state] Cleared stored messages for session ${sessionId.slice(0, 8)}...`);
  }
}
