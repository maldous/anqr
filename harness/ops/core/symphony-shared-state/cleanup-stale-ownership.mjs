import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";
import { OWNERSHIP_FILE_NAME, OWNERSHIP_TTL_MS } from "./ownership-constants.mjs";

/**
 * Clean up all stale ownership records.
 * Returns the number of records cleaned.
 *
 * @returns {number}
 */
export function cleanupStaleOwnership() {
  return withBridgeLock(OWNERSHIP_FILE_NAME, () => {
    const state = loadBridgeFile(OWNERSHIP_FILE_NAME);
    const now = Date.now();
    let cleaned = 0;
    for (const [key, record] of Object.entries(state)) {
      if (now - record.startedAt > OWNERSHIP_TTL_MS) {
        delete state[key];
        cleaned++;
      }
    }
    if (cleaned > 0) {
      saveBridgeFile(OWNERSHIP_FILE_NAME, state);
    }
    return cleaned;
  });
}
