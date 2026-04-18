import { getJobOwnership } from "./get-job-ownership.mjs";

/**
 * Check if a session key has an active (non-stale) ownership record.
 *
 * @param {string} sessionKey - Canonical session key
 * @returns {boolean}
 */
export function hasActiveJob(sessionKey) {
  return getJobOwnership(sessionKey) !== null;
}
