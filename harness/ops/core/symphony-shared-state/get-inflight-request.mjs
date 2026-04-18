import { loadBridgeFile } from "./bridge-file-helpers.mjs";
import { completeInflightRequest } from "./complete-inflight-request.mjs";
import { INFLIGHT_FILE_NAME, INFLIGHT_TTL_MS } from "./rehydration-constants.mjs";

/**
 * Get an in-flight request record.
 * Returns null if the record doesn't exist or is stale.
 *
 * @param {string} requestId
 * @returns {{ sessionKey?: string, worktreeId?: string, providerName?: string, model?: string, startedAt: number }|null}
 */
export function getInflightRequest(requestId) {
  if (!requestId) return null;
  const state = loadBridgeFile(INFLIGHT_FILE_NAME);
  const record = state[requestId];
  if (!record) return null;
  if (Date.now() - record.startedAt > INFLIGHT_TTL_MS) {
    completeInflightRequest(requestId);
    return null;
  }
  return record;
}
