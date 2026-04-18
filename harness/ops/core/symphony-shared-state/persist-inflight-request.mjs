import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";
import { INFLIGHT_FILE_NAME } from "./rehydration-constants.mjs";

/**
 * Persist an in-flight request so it can be detected as stale on restart.
 *
 * @param {string} requestId - Unique request identifier (e.g. "req-42")
 * @param {{ sessionKey?: string, worktreeId?: string, providerName?: string, model?: string, startedAt?: number }} details
 */
export function persistInflightRequest(requestId, details) {
  if (!requestId) return;
  withBridgeLock(INFLIGHT_FILE_NAME, () => {
    const state = loadBridgeFile(INFLIGHT_FILE_NAME);
    state[requestId] = {
      ...details,
      startedAt: details.startedAt || Date.now(),
    };
    saveBridgeFile(INFLIGHT_FILE_NAME, state);
  });
}
