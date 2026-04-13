import { getWorktreeState } from "../../../symphony-state.mjs";
import { LINEAR_WORKTREE_HEALTH_STATES } from "../../../core/linear-worktree-health-states.mjs";
import { normalizeWorktreeState } from "./normalize-worktree-state.mjs";

const LINEAR_WORKTREE_IDS = [1, 2, 3, 4];

const HEALTHY_STATES = new Set([
  LINEAR_WORKTREE_HEALTH_STATES.AVAILABLE,
  LINEAR_WORKTREE_HEALTH_STATES.EXECUTING,
  LINEAR_WORKTREE_HEALTH_STATES.DIRTY_REPAIRABLE,
]);

export function getHealthyLinearCapacity() {
  const worktrees = [];

  for (const id of LINEAR_WORKTREE_IDS) {
    const wtId = `wt${id}`;
    const state = getWorktreeState(wtId);
    const classification = normalizeWorktreeState(state?.state || "available");
    const healthy = HEALTHY_STATES.has(classification);
    const executing = classification === LINEAR_WORKTREE_HEALTH_STATES.EXECUTING;
    worktrees.push({
      id,
      wtId,
      state: classification,
      rawState: state?.state || "available",
      healthy,
      executing,
      issueIdentifier: state?.issueIdentifier || null,
      lastError: state?.lastError || null,
      reason: state?.reason || null,
    });
  }

  const healthy = worktrees.filter((w) => w.healthy);
  const available = healthy.filter((w) => !w.executing);

  return {
    total: LINEAR_WORKTREE_IDS.length,
    healthy: healthy.length,
    available: available.length,
    executing: healthy.filter((w) => w.executing).length,
    unhealthy: worktrees.filter((w) => !w.healthy).length,
    worktrees,
  };
}
