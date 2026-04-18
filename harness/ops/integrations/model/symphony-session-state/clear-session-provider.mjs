import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";
import { logDebug } from "./logger.mjs";

const FILE_NAME = "session-state.json";

export function clearSessionProvider(sessionId) {
  if (!sessionId) return;

  withBridgeLock(FILE_NAME, () => {
    const state = loadSessionState();
    const session = state[sessionId];
    if (session) {
      // Preserve messages and messageHash, clear provider and turn state
      const { messages, messageHash, source } = session;
      state[sessionId] = {
        messages,
        messageHash,
        source,
        lastUsed: Date.now(),
      };
      saveSessionState(state);
      logDebug(
        `[session-state] Cleared provider sticky for session ${sessionId.slice(0, 8)}..., preserved ${messages?.length || 0} messages`,
      );
    }
  });
}
