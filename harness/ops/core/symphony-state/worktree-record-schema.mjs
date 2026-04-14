/**
 * Worktree ownership record schema — Workstream B Phase 1.
 *
 * Defines the canonical shape for worktree state records and provides
 * a normalizer that enforces it. The current codebase uses freeform
 * patches via transitionWorktree(); this schema locks the expected shape
 * so that all readers and future transition helpers agree on fields.
 *
 * Design rule: normalizeWorktreeRecord() is additive — it accepts
 * existing records (which may use `issueIdentifier`) and normalizes
 * them to the canonical shape (which uses `assignedIssue`). Both
 * field names are accepted during the transition period.
 */

/** @enum {string} */
export const WORKTREE_STATES = Object.freeze({
  /** Free for assignment — no active work. */
  available: "available",

  /** Actively executing an issue. */
  executing: "executing",

  /** Has uncommitted changes, owned by a known issue. */
  dirty_owned: "dirty_owned",

  /** Has uncommitted changes, owner unknown or lost. */
  dirty_orphaned: "dirty_orphaned",

  /** Quarantined due to errors — needs operator or recovery attention. */
  quarantined: "quarantined",

  /** Blocked — cannot be used for execution. */
  blocked: "blocked",
});

/** Set of all valid worktree state values for runtime validation. */
export const VALID_WORKTREE_STATES = new Set(Object.values(WORKTREE_STATES));

/**
 * Normalize a worktree state record into the canonical schema.
 *
 * Accepts both old-style records (with `issueIdentifier`) and new-style
 * records (with `assignedIssue`). The output always uses `assignedIssue`.
 *
 * @param {string} worktreeId
 * @param {object} record
 * @returns {object} Normalized worktree record
 */
export function normalizeWorktreeRecord(worktreeId, record = {}) {
  // Accept both old `issueIdentifier` and new `assignedIssue` field names
  const assignedIssue = record.assignedIssue || record.issueIdentifier || null;

  return {
    worktreeId,
    state: VALID_WORKTREE_STATES.has(record.state) ? record.state : "available",
    assignedIssue,
    owner: record.owner || null,
    leasedAt: record.leasedAt || null,
    quarantinedAt: record.quarantinedAt || null,
    reason: record.reason || null,
    repairAttempts: Number(record.repairAttempts || 0),
    lastError: record.lastError || null,
    updatedAt: record.updatedAt || null,
  };
}
