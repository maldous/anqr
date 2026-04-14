/**
 * Infer the execution phase of an issue from its scattered state fields.
 * Workstream B Phase 1 — read-side consistency helper.
 *
 * The current codebase stores lifecycle information across multiple fields:
 * lease, cooldown_until, human_only, retry_exhausted, blocked_reason,
 * finalization.state, completed_at, etc. This helper derives one canonical
 * ISSUE_PHASES value so that all readers agree on "where is this issue?"
 *
 * Design rule: this is read-side ONLY. The phase is NOT persisted. Once
 * transition helpers are the sole write API (Phase 2–3), phase will be
 * derived from the transition record rather than inferred from scattered
 * fields.
 *
 * Priority order (higher wins):
 * 1. Active lease → claimed / executing (work is happening)
 * 2. completed_at  → completed (finished)
 * 3. Hard blocks   → blocked (needs human attention)
 * 4. Cooldown      → cooldown (temporary scheduling hold)
 * 5. Finalization   → mapped phase (post-execution lifecycle)
 * 6. Default        → eligible
 */

import { ISSUE_PHASES, FINALIZATION_STATE_TO_PHASE } from "./issue-phases.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";

/**
 * Derive the canonical execution phase from a normalized issue record.
 *
 * @param {object} record - A normalized issue record (from normalizeRecord)
 * @param {number} [now]  - Current timestamp for lease/cooldown checks
 * @returns {string} One of ISSUE_PHASES values
 */
export function inferExecutionPhase(record, now = Date.now()) {
  if (!record) return ISSUE_PHASES.eligible;

  // 1. Active lease — work is in progress, this is the authoritative signal
  if (leaseIsActive(record, now)) {
    const lease = record.lease;
    // If the lease has a run_id, the runner has started execution.
    // Otherwise the scheduler has claimed but the runner hasn't picked it up.
    return lease && lease.run_id
      ? ISSUE_PHASES.executing
      : ISSUE_PHASES.claimed;
  }

  // 2. Completed — finished lifecycle
  if (record.completed_at) {
    return ISSUE_PHASES.completed;
  }

  // 3. Hard blocks — needs human attention
  if (record.human_only || record.retry_exhausted || record.blocked_reason) {
    return ISSUE_PHASES.blocked;
  }

  // 4. Cooldown — temporary scheduling hold
  if (record.cooldown_until && new Date(record.cooldown_until).getTime() > now) {
    return ISSUE_PHASES.cooldown;
  }

  // 5. Finalization state — post-execution lifecycle
  if (record.finalization && record.finalization.state) {
    const mapped = FINALIZATION_STATE_TO_PHASE[record.finalization.state];
    // Unknown finalization states conservatively map to integration_pending
    // to prevent re-claiming of issues in an unrecognized finalization state.
    return mapped || ISSUE_PHASES.integration_pending;
  }

  // 6. Default — eligible for scheduling
  return ISSUE_PHASES.eligible;
}
