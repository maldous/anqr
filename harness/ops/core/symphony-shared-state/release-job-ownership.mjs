import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";
import { OWNERSHIP_FILE_NAME } from "./ownership-constants.mjs";

/**
 * Release ownership of an active job for a session key.
 * Called when the request completes (success or error).
 *
 * @param {string} sessionKey - Canonical session key
 */
export function releaseJobOwnership(sessionKey) {
  if (!sessionKey) return;
  withBridgeLock(OWNERSHIP_FILE_NAME, () => {
    const state = loadBridgeFile(OWNERSHIP_FILE_NAME);
    if (state[sessionKey]) {
      delete state[sessionKey];
      saveBridgeFile(OWNERSHIP_FILE_NAME, state);
    }
  });
}
