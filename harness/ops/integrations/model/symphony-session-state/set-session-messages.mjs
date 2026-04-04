import { hashMessages } from "./hash-messages.mjs";
import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { logWarn, logDebug } from "./logger.mjs";

export function setSessionMessages(sessionId, messages) {
  if (!sessionId) return;

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
}
