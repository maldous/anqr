import { leaseIsActive, getIssueState } from "../../../symphony-state.mjs";

/**
 * ADR-0002: Verify the issue has an active scheduler claim before the router
 * dispatches it. The router is transport, not authority. This check is always
 * enforced — there is no bypass mode.
 *
 * Verification checks (all required for "allowed"):
 * 1. Active lease exists
 * 2. Lease owner is "scheduler" (not a stale runner-acquired lease)
 * 3. Durable assignment metadata exists with a worktreeId
 *
 * Assumption: scheduler and router share the same filesystem-backed state file
 * (symphony-state JSON). Both run on the same host. If they are ever separated,
 * this check must be replaced with an RPC or token-based claim proof.
 *
 * @returns {{ allowed: boolean, reason?: string, assignedWorktreeId?: string }}
 */
export function verifySchedulerClaim(identifier) {
  const state = getIssueState(identifier);
  if (!state || !leaseIsActive(state)) {
    return { allowed: false, reason: "no_active_claim" };
  }

  // ADR-0002: Verify the claim is scheduler-originated, not a stale lease
  // from a runner or other actor.
  if (!state.lease || state.lease.owner !== "scheduler") {
    return { allowed: false, reason: "not_scheduler_owned" };
  }

  // ADR-0002: Verify durable assignment metadata exists. The scheduler
  // assigns a worktree at claim time; the router honours that assignment.
  if (!state.assignment || !state.assignment.worktreeId) {
    return { allowed: false, reason: "no_worktree_assignment" };
  }

  return { allowed: true, assignedWorktreeId: state.assignment.worktreeId };
}
