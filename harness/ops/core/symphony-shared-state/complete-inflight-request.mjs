import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";
import { INFLIGHT_FILE_NAME } from "./rehydration-constants.mjs";

/**
 * Remove an in-flight request record (called on successful completion).
 *
 * @param {string} requestId - Unique request identifier
 */
export function completeInflightRequest(requestId) {
  if (!requestId) return;
  withBridgeLock(INFLIGHT_FILE_NAME, () => {
    const state = loadBridgeFile(INFLIGHT_FILE_NAME);
    if (state[requestId]) {
      delete state[requestId];
      saveBridgeFile(INFLIGHT_FILE_NAME, state);
    }
  });
}
