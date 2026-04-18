import { loadBridgeFile } from "./bridge-file-helpers.mjs";
import { INFLIGHT_FILE_NAME, INFLIGHT_TTL_MS } from "./rehydration-constants.mjs";

/**
 * Get all active (non-stale) in-flight request records.
 * Useful for diagnostics and the /health endpoint.
 *
 * @returns {Record<string, { sessionKey?: string, worktreeId?: string, startedAt: number }>}
 */
export function getAllInflightRequests() {
  const state = loadBridgeFile(INFLIGHT_FILE_NAME);
  const now = Date.now();
  const result = {};
  for (const [key, record] of Object.entries(state)) {
    if (now - record.startedAt <= INFLIGHT_TTL_MS) {
      result[key] = record;
    }
  }
  return result;
}
