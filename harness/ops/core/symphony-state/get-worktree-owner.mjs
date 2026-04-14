/**
 * Durable worktree ownership lookup — Workstream B Phase 2.
 *
 * Returns the issue identifier that owns the given worktree, reading
 * from durable worktree state. This is the primary ownership lookup
 * path per the reviewer's guidance: durable worktree state is the
 * authority; reverse scans of issues are validation/repair only.
 *
 * Handles both old-style `issueIdentifier` and new-style `assignedIssue`
 * field names during the transition period.
 *
 * @module get-worktree-owner
 */

import { getWorktreeState } from "./get-worktree-state.mjs";

/**
 * Get the issue identifier that owns a worktree.
 *
 * @param {string} worktreeId
 * @returns {string|null} Issue identifier or null if unassigned/unknown
 */
export function getWorktreeOwner(worktreeId) {
  const wtState = getWorktreeState(worktreeId);
  if (!wtState) return null;
  return wtState.assignedIssue || wtState.issueIdentifier || null;
}
