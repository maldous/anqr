import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";

const FILE_NAME = "session-state.json";

/**
 * Set source identity metadata on a session record.
 * Called once at request entry after canonical session key resolution.
 *
 * @param {string} sessionId - The effective session key
 * @param {{ type: 'discord'|'linear'|'header', discordGuildId?: string, discordChannelId?: string, linearIssueIdentifier?: string }} source
 */
export function setSessionSource(sessionId, source) {
  if (!sessionId || !source) return;

  withBridgeLock(FILE_NAME, () => {
    const state = loadSessionState();
    const session = state[sessionId];
    if (session) {
      session.source = source;
      session.lastUsed = Date.now();
    } else {
      // Create a stub session with source identity (will be enriched by updateSessionProvider later)
      state[sessionId] = {
        lastUsed: Date.now(),
        source,
      };
    }
    saveSessionState(state);
  });
}
