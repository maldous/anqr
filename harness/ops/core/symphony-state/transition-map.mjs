/**
 * State transition maps — Workstream B Phase 1.
 *
 * Defines which phase/state transitions are valid for issues and worktrees.
 * Used by future transitionIssue() and transitionWorktree() helpers (Phase 2)
 * and by inferExecutionPhase() for read-side consistency checks.
 *
 * Design rule: these maps describe the intended lifecycle. They do not
 * yet enforce transitions — that happens in Phase 2 when transition
 * helpers become the sole write API.
 */

import { ISSUE_PHASES } from "./issue-phases.mjs";
import { WORKTREE_STATES } from "./worktree-record-schema.mjs";

// ---------------------------------------------------------------------------
// Issue phase transitions
// ---------------------------------------------------------------------------

/**
 * Map of issue phase → Set of allowed target phases.
 *
 * Derived from observed code paths:
 * - Scheduler: eligible → claimed
 * - Router dispatch: claimed → executing
 * - Runner completion: executing → integration_pending / validation_failed / etc.
 * - Integrator: integration_pending → evidence_pending / integration_failed
 * - Closeout: evidence_pending → completed
 * - Retry: *_failed → executing (via re-claim)
 * - Cooldown: executing → cooldown → eligible
 * - Block: any active → blocked
 * - Unblock: blocked → eligible
 * - Reopen: completed → eligible
 */
export const ISSUE_TRANSITION_MAP = Object.freeze({
  [ISSUE_PHASES.eligible]: new Set([
    ISSUE_PHASES.claimed,
    ISSUE_PHASES.blocked,
    ISSUE_PHASES.cooldown,
  ]),

  [ISSUE_PHASES.claimed]: new Set([
    ISSUE_PHASES.executing,
    ISSUE_PHASES.eligible, // lease expired or released
    ISSUE_PHASES.blocked,
  ]),

  [ISSUE_PHASES.executing]: new Set([
    ISSUE_PHASES.validation_failed,
    ISSUE_PHASES.commit_failed,
    ISSUE_PHASES.push_failed,
    ISSUE_PHASES.integration_pending,
    ISSUE_PHASES.cooldown,
    ISSUE_PHASES.blocked,
    ISSUE_PHASES.eligible, // lease expired
  ]),

  [ISSUE_PHASES.cooldown]: new Set([
    ISSUE_PHASES.eligible, // cooldown expired
    ISSUE_PHASES.blocked,
  ]),

  [ISSUE_PHASES.blocked]: new Set([
    ISSUE_PHASES.eligible, // manual unblock / retry reset
  ]),

  [ISSUE_PHASES.validation_failed]: new Set([
    ISSUE_PHASES.executing, // sticky repair retry
    ISSUE_PHASES.blocked, // exhausted retries
    ISSUE_PHASES.eligible, // manual reset
  ]),

  [ISSUE_PHASES.commit_failed]: new Set([
    ISSUE_PHASES.executing, // sticky repair retry
    ISSUE_PHASES.blocked, // exhausted retries
    ISSUE_PHASES.eligible, // manual reset
  ]),

  [ISSUE_PHASES.push_failed]: new Set([
    ISSUE_PHASES.executing, // sticky repair retry
    ISSUE_PHASES.blocked, // exhausted retries
    ISSUE_PHASES.eligible, // manual reset
  ]),

  [ISSUE_PHASES.integration_pending]: new Set([
    ISSUE_PHASES.evidence_pending,
    ISSUE_PHASES.integration_failed,
  ]),

  [ISSUE_PHASES.evidence_pending]: new Set([
    ISSUE_PHASES.completed,
    ISSUE_PHASES.evidence_pending, // metadata annotation during retry
    ISSUE_PHASES.integration_pending, // retry evidence publication
    ISSUE_PHASES.integration_failed, // error during closeout
  ]),

  [ISSUE_PHASES.integration_failed]: new Set([
    ISSUE_PHASES.integration_pending, // retry integration
    ISSUE_PHASES.blocked, // exhausted retries
    ISSUE_PHASES.eligible, // manual reset
  ]),

  [ISSUE_PHASES.completed]: new Set([
    ISSUE_PHASES.eligible, // reopen / operator action
  ]),
});

// ---------------------------------------------------------------------------
// Worktree state transitions
// ---------------------------------------------------------------------------

/**
 * Map of worktree state → Set of allowed target states.
 *
 * Derived from observed code paths:
 * - Scheduler assigns: available → executing
 * - Runner finishes: executing → dirty_owned / available
 * - Recovery classifies: dirty_owned → quarantined / available
 * - Recovery identifies: dirty_orphaned → dirty_owned / quarantined
 * - Clear quarantine: quarantined → available
 * - Watchdog blocks: any → quarantined
 */
export const WORKTREE_TRANSITION_MAP = Object.freeze({
  [WORKTREE_STATES.available]: new Set([WORKTREE_STATES.executing, WORKTREE_STATES.quarantined]),

  [WORKTREE_STATES.executing]: new Set([
    WORKTREE_STATES.dirty_owned,
    WORKTREE_STATES.available,
    WORKTREE_STATES.quarantined,
  ]),

  [WORKTREE_STATES.dirty_owned]: new Set([
    WORKTREE_STATES.executing, // sticky repair
    WORKTREE_STATES.available, // cleaned
    WORKTREE_STATES.quarantined,
    WORKTREE_STATES.dirty_orphaned, // owner lost
  ]),

  [WORKTREE_STATES.dirty_orphaned]: new Set([
    WORKTREE_STATES.quarantined,
    WORKTREE_STATES.available, // cleaned via reset
    WORKTREE_STATES.dirty_owned, // owner identified
  ]),

  [WORKTREE_STATES.quarantined]: new Set([
    WORKTREE_STATES.available, // cleared
    WORKTREE_STATES.dirty_owned, // repair attempt
  ]),

  [WORKTREE_STATES.blocked]: new Set([WORKTREE_STATES.available, WORKTREE_STATES.quarantined]),
});
