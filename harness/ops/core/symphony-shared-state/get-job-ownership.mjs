import { loadBridgeFile } from "./bridge-file-helpers.mjs";
import { releaseJobOwnership } from "./release-job-ownership.mjs";
import { OWNERSHIP_FILE_NAME, OWNERSHIP_TTL_MS } from "./ownership-constants.mjs";

/**
 * Get the current ownership record for a session key.
 * Returns null if no ownership exists or if the ownership is stale.
 *
 * @param {string} sessionKey - Canonical session key
 * @returns {{ worktreeId: string, requestId?: string, correlationId?: string, channelId?: string, guildId?: string, startedAt: number }|null}
 */
export function getJobOwnership(sessionKey) {
  if (!sessionKey) return null;
  const state = loadBridgeFile(OWNERSHIP_FILE_NAME);
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
