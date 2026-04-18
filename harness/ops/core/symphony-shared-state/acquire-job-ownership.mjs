import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";
import { OWNERSHIP_FILE_NAME } from "./ownership-constants.mjs";

/**
 * Acquire durable ownership of an active job for a session key.
 * Overwrites any existing (stale) ownership for the same session.
 *
 * @param {string} sessionKey - Canonical session key (e.g. "discord:guild:channel")
 * @param {{ worktreeId: string, requestId?: string, correlationId?: string, channelId?: string, guildId?: string }} details
 */
export function acquireJobOwnership(sessionKey, details) {
  if (!sessionKey) return;
  withBridgeLock(OWNERSHIP_FILE_NAME, () => {
    const state = loadBridgeFile(OWNERSHIP_FILE_NAME);
    state[sessionKey] = {
      ...details,
      startedAt: Date.now(),
    };
    saveBridgeFile(OWNERSHIP_FILE_NAME, state);
  });
}
