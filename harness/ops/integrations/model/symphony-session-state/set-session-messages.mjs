import { hashMessages } from "./hash-messages.mjs";
import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";
import { logWarn, logDebug } from "./logger.mjs";

const FILE_NAME = "session-state.json";

export function setSessionMessages(sessionId, messages) {
  if (!sessionId) return;

  withBridgeLock(FILE_NAME, () => {
    const state = loadSessionState();
    const session = state[sessionId];
    if (!session) {
      logWarn(`[session-state] setSessionMessages: session ${sessionId} not found`);
      return;
    }

    // Store a deep copy to avoid external mutation
    const messagesCopy = structuredClone(messages);
    session.messages = messagesCopy;
    session.messageHash = hashMessages(messagesCopy);
    session.lastUsed = Date.now(); // Update timestamp

    saveSessionState(state);
    logDebug(
      `[session-state] Stored ${messagesCopy.length} messages for session ${sessionId.slice(0, 8)}...`,
    );
  });
}
