import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";
import { logDebug } from "./logger.mjs";

const FILE_NAME = "session-state.json";

export function clearSessionMessages(sessionId) {
  if (!sessionId) return;

  withBridgeLock(FILE_NAME, () => {
    const state = loadSessionState();
    const session = state[sessionId];
    if (session) {
      delete session.messages;
      delete session.messageHash;
      saveSessionState(state);
      logDebug(`[session-state] Cleared stored messages for session ${sessionId.slice(0, 8)}...`);
    }
  });
}
