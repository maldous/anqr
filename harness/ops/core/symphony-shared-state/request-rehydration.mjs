import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";

const FILE_NAME = "inflight-requests.json";

/** TTL for in-flight request records — 10 minutes (2× typical request timeout). */
const INFLIGHT_TTL_MS = 10 * 60 * 1000;

/**
 * Persist an in-flight request so it can be detected as stale on restart.
 *
 * @param {string} requestId - Unique request identifier (e.g. "req-42")
 * @param {{ sessionKey?: string, worktreeId?: string, providerName?: string, model?: string, startedAt?: number }} details
 */
export function persistInflightRequest(requestId, details) {
  if (!requestId) return;
  withBridgeLock(FILE_NAME, () => {
    const state = loadBridgeFile(FILE_NAME);
    state[requestId] = {
      ...details,
      startedAt: details.startedAt || Date.now(),
    };
    saveBridgeFile(FILE_NAME, state);
  });
}

/**
 * Remove an in-flight request record (called on successful completion).
 *
 * @param {string} requestId - Unique request identifier
 */
export function completeInflightRequest(requestId) {
  if (!requestId) return;
  withBridgeLock(FILE_NAME, () => {
    const state = loadBridgeFile(FILE_NAME);
    if (state[requestId]) {
      delete state[requestId];
      saveBridgeFile(FILE_NAME, state);
    }
  });
}

/**
 * Get an in-flight request record.
 * Returns null if the record doesn't exist or is stale.
 *
 * @param {string} requestId
 * @returns {{ sessionKey?: string, worktreeId?: string, providerName?: string, model?: string, startedAt: number }|null}
 */
export function getInflightRequest(requestId) {
  if (!requestId) return null;
  const state = loadBridgeFile(FILE_NAME);
  const record = state[requestId];
  if (!record) return null;
  if (Date.now() - record.startedAt > INFLIGHT_TTL_MS) {
    completeInflightRequest(requestId);
    return null;
  }
  return record;
}

/**
 * Scan for stale in-flight requests (called at startup).
 * Returns array of stale request records that were cleaned up.
 * Each record includes its requestId for logging/diagnostics.
 *
 * @returns {Array<{ requestId: string, sessionKey?: string, worktreeId?: string, startedAt: number }>}
 */
export function scanStaleInflightRequests() {
  return withBridgeLock(FILE_NAME, () => {
    const state = loadBridgeFile(FILE_NAME);
    const now = Date.now();
    const stale = [];
    for (const [requestId, record] of Object.entries(state)) {
      if (now - record.startedAt > INFLIGHT_TTL_MS) {
        stale.push({ requestId, ...record });
        delete state[requestId];
      }
    }
    if (stale.length > 0) {
      saveBridgeFile(FILE_NAME, state);
    }
    return stale;
  });
}

/**
 * Get all active (non-stale) in-flight request records.
 * Useful for diagnostics and the /health endpoint.
 *
 * @returns {Record<string, { sessionKey?: string, worktreeId?: string, startedAt: number }>}
 */
export function getAllInflightRequests() {
  const state = loadBridgeFile(FILE_NAME);
  const now = Date.now();
  const result = {};
  for (const [key, record] of Object.entries(state)) {
    if (now - record.startedAt <= INFLIGHT_TTL_MS) {
      result[key] = record;
    }
  }
  return result;
}

/** Export TTL for tests. */
export { INFLIGHT_TTL_MS };
