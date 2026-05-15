import { getWorktreeState } from "../../../symphony-state.mjs";
import { globalActiveRequests, setGlobalActiveRequests } from "./global-active-requests.mjs";
import { WORKTREES } from "./worktrees.mjs";
import { logDebug } from "./logger.mjs";

/**
 * Reconcile transient activeRequests counters with durable worktree state.
 *
 * Phase 4: Counters are observation-only; durable state is authority for
 * Linear worktrees (wt1–4). This function syncs counters to match durable
 * state for health-endpoint accuracy and observation bookkeeping.
 *
 * Discord worktrees (wt5–8) are not reconciled because they use transient
 * HTTP proxy routing without durable claims.
 *
 * @returns {number} Number of counter corrections applied
 */
export function reconcileWorktreeCounters() {
  let corrections = 0;
  for (const wt of WORKTREES) {
    // Only reconcile Linear worktrees — Discord has no durable claims
    if (wt.id < 1 || wt.id > 4) continue;

    const state = getWorktreeState(`wt${wt.id}`);
    const durableExecuting = state?.state === "executing";

    if (durableExecuting && wt.activeRequests === 0) {
      wt.activeRequests = 1;
      corrections++;
    } else if (!durableExecuting && wt.activeRequests > 0) {
      wt.activeRequests = 0;
      corrections++;
    }
  }

  const activeRequestTotal = WORKTREES.reduce(
    (total, wt) => total + Math.max(0, wt.activeRequests || 0),
    0,
  );
  if (globalActiveRequests !== activeRequestTotal) {
    setGlobalActiveRequests(activeRequestTotal);
    corrections++;
  }

  if (corrections > 0) {
    logDebug(`[reconcile] Corrected ${corrections} worktree counter(s) from durable state`);
  }
  return corrections;
}
