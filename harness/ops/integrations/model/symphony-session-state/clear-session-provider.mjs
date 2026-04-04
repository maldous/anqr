// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:185

import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { logDebug } from "./logger.mjs";

export function clearSessionProvider(sessionId) {
  if (!sessionId) return;

  const state = loadSessionState();
  const session = state[sessionId];
  if (session) {
    // Preserve messages and messageHash, clear provider and turn state
    const { messages, messageHash } = session;
    state[sessionId] = {
      messages,
      messageHash,
      lastUsed: Date.now(),
    };
    saveSessionState(state);
    logDebug(
      `[session-state] Cleared provider sticky for session ${sessionId.slice(0, 8)}..., preserved ${messages?.length || 0} messages`,
    );
  }
}
