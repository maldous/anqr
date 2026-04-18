import { loadBridgeFile } from "./bridge-file-helpers.mjs";
import { OWNERSHIP_FILE_NAME, OWNERSHIP_TTL_MS } from "./ownership-constants.mjs";

/**
 * Get all active ownership records (non-stale).
 * Useful for diagnostics and the /health endpoint.
 *
 * @returns {Record<string, { worktreeId: string, startedAt: number }>}
 */
export function getAllActiveOwnership() {
  const state = loadBridgeFile(OWNERSHIP_FILE_NAME);
  const now = Date.now();
  const result = {};
  for (const [key, record] of Object.entries(state)) {
    if (now - record.startedAt <= OWNERSHIP_TTL_MS) {
      result[key] = record;
    }
  }
  return result;
}
