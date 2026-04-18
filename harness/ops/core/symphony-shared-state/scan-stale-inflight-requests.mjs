import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";
import { INFLIGHT_FILE_NAME, INFLIGHT_TTL_MS } from "./rehydration-constants.mjs";

/**
 * Scan for stale in-flight requests (called at startup).
 * Returns array of stale request records that were cleaned up.
 * Each record includes its requestId for logging/diagnostics.
 *
 * @returns {Array<{ requestId: string, sessionKey?: string, worktreeId?: string, startedAt: number }>}
 */
export function scanStaleInflightRequests() {
  return withBridgeLock(INFLIGHT_FILE_NAME, () => {
    const state = loadBridgeFile(INFLIGHT_FILE_NAME);
    const now = Date.now();
    const stale = [];
    for (const [requestId, record] of Object.entries(state)) {
      if (now - record.startedAt > INFLIGHT_TTL_MS) {
        stale.push({ requestId, ...record });
        delete state[requestId];
      }
    }
    if (stale.length > 0) {
      saveBridgeFile(INFLIGHT_FILE_NAME, state);
    }
    return stale;
  });
}
