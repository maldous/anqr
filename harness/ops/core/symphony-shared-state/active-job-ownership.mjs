import { loadBridgeFile, saveBridgeFile } from "./bridge-file-helpers.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";

const FILE_NAME = "active-job-ownership.json";

/** TTL for ownership records — 5 minutes (matches typical request timeout). */
const OWNERSHIP_TTL_MS = 5 * 60 * 1000;

/**
 * Acquire durable ownership of an active job for a session key.
 * Overwrites any existing (stale) ownership for the same session.
 *
 * @param {string} sessionKey - Canonical session key (e.g. "discord:guild:channel")
 * @param {{ worktreeId: string, requestId?: string, correlationId?: string, channelId?: string, guildId?: string }} details
 */
export function acquireJobOwnership(sessionKey, details) {
  if (!sessionKey) return;
  withBridgeLock(FILE_NAME, () => {
    const state = loadBridgeFile(FILE_NAME);
    state[sessionKey] = {
      ...details,
      startedAt: Date.now(),
    };
    saveBridgeFile(FILE_NAME, state);
  });
}

/**
 * Release ownership of an active job for a session key.
 * Called when the request completes (success or error).
 *
 * @param {string} sessionKey - Canonical session key
 */
export function releaseJobOwnership(sessionKey) {
  if (!sessionKey) return;
  withBridgeLock(FILE_NAME, () => {
    const state = loadBridgeFile(FILE_NAME);
    if (state[sessionKey]) {
      delete state[sessionKey];
      saveBridgeFile(FILE_NAME, state);
    }
  });
}

/**
 * Get the current ownership record for a session key.
 * Returns null if no ownership exists or if the ownership is stale.
 *
 * @param {string} sessionKey - Canonical session key
 * @returns {{ worktreeId: string, requestId?: string, correlationId?: string, channelId?: string, guildId?: string, startedAt: number }|null}
 */
export function getJobOwnership(sessionKey) {
  if (!sessionKey) return null;
  const state = loadBridgeFile(FILE_NAME);
  const record = state[sessionKey];
  if (!record) return null;
  // Stale records are treated as non-existent
  if (Date.now() - record.startedAt > OWNERSHIP_TTL_MS) {
    // Clean up stale record
    releaseJobOwnership(sessionKey);
    return null;
  }
  return record;
}

/**
 * Check if a session key has an active (non-stale) ownership record.
 *
 * @param {string} sessionKey - Canonical session key
 * @returns {boolean}
 */
export function hasActiveJob(sessionKey) {
  return getJobOwnership(sessionKey) !== null;
}

/**
 * Clean up all stale ownership records.
 * Returns the number of records cleaned.
 *
 * @returns {number}
 */
export function cleanupStaleOwnership() {
  return withBridgeLock(FILE_NAME, () => {
    const state = loadBridgeFile(FILE_NAME);
    const now = Date.now();
    let cleaned = 0;
    for (const [key, record] of Object.entries(state)) {
      if (now - record.startedAt > OWNERSHIP_TTL_MS) {
        delete state[key];
        cleaned++;
      }
    }
    if (cleaned > 0) {
      saveBridgeFile(FILE_NAME, state);
    }
    return cleaned;
  });
}

/**
 * Get all active ownership records (non-stale).
 * Useful for diagnostics and the /health endpoint.
 *
 * @returns {Record<string, { worktreeId: string, startedAt: number }>}
 */
export function getAllActiveOwnership() {
  const state = loadBridgeFile(FILE_NAME);
  const now = Date.now();
  const result = {};
  for (const [key, record] of Object.entries(state)) {
    if (now - record.startedAt <= OWNERSHIP_TTL_MS) {
      result[key] = record;
    }
  }
  return result;
}

/** Export TTL for tests. */
export { OWNERSHIP_TTL_MS };
