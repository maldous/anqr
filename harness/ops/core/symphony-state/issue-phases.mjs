/**
 * Issue execution phase enum — Workstream B Phase 1.
 *
 * These are the high-level lifecycle phases an issue passes through.
 * The current codebase infers phase from scattered fields (lease, cooldown,
 * blocked_reason, finalization.state, completed_at, etc.). This enum
 * defines the canonical set so that read-side helpers and future
 * transition validators share one vocabulary.
 *
 * Design rule: inferExecutionPhase(record) derives the phase from existing
 * fields. The phase is NOT persisted yet — it is read-side only until
 * mutating paths are unified through transition helpers (Phase 2–3).
 */

/** @enum {string} */
export const ISSUE_PHASES = Object.freeze({
  /** No blocking conditions, no active lease, not completed — available for scheduling. */
  eligible: "eligible",

  /** Scheduler has claimed the issue (active lease, owner=scheduler, no run_id yet). */
  claimed: "claimed",

  /** Runner is actively executing (active lease with run_id set). */
  executing: "executing",

  /** On exponential backoff cooldown — temporarily ineligible. */
  cooldown: "cooldown",

  /** Blocked: human_only, retry_exhausted, or has blocked_reason. Needs human attention. */
  blocked: "blocked",

  /** Validation failed after execution (repairable or terminal). */
  validation_failed: "validation_failed",

  /** Commit failed after execution (repairable or terminal). */
  commit_failed: "commit_failed",

  /** Branch push failed after execution (repairable). */
  push_failed: "push_failed",

  /** Awaiting integrator pickup — code is committed and pushed to worktree branch. */
  integration_pending: "integration_pending",

  /** Awaiting evidence publication and issue closeout. */
  evidence_pending: "evidence_pending",

  /** Integration to main failed (repairable). */
  integration_failed: "integration_failed",

  /** Successfully completed — evidence published, issue closed. */
  completed: "completed",
});

/**
 * Maps granular finalization.state values (as written by execute-issue.mjs
 * and integrate-candidate.mjs) to high-level ISSUE_PHASES.
 *
 * Unknown finalization states map to `integration_pending` as a conservative
 * default — this prevents re-claiming of issues in an unrecognized state.
 */
export const FINALIZATION_STATE_TO_PHASE = Object.freeze({
  validation_failed_repairable: ISSUE_PHASES.validation_failed,
  commit_failed_repairable: ISSUE_PHASES.commit_failed,
  commit_failed_blocked: ISSUE_PHASES.commit_failed,
  branch_push_failed_repairable: ISSUE_PHASES.push_failed,
  integration_pending: ISSUE_PHASES.integration_pending,
  local_commit_complete: ISSUE_PHASES.integration_pending,
  evidence_pending_closeout: ISSUE_PHASES.evidence_pending,
  integration_failed_repairable: ISSUE_PHASES.integration_failed,
  integrated_main: ISSUE_PHASES.completed,
});

/** Set of all valid phase values for runtime validation. */
export const VALID_ISSUE_PHASES = new Set(Object.values(ISSUE_PHASES));
