import { getWorktreeState } from "../../symphony-state.mjs";

const LINEAR_WORKTREE_IDS = [1, 2, 3, 4];
export const LINEAR_WORKTREE_HEALTH_STATES = Object.freeze({
  AVAILABLE: "available",
  EXECUTING: "executing",
  DIRTY_REPAIRABLE: "dirty_repairable",
  DIVERGED: "diverged",
  QUARANTINED: "quarantined",
  INTEGRATION_BLOCKED: "integration_blocked",
  UNAVAILABLE: "unavailable",
});

const HEALTHY_STATES = new Set([
  LINEAR_WORKTREE_HEALTH_STATES.AVAILABLE,
  LINEAR_WORKTREE_HEALTH_STATES.EXECUTING,
  LINEAR_WORKTREE_HEALTH_STATES.DIRTY_REPAIRABLE,
]);

function normalizeWorktreeState(state) {
  switch (state) {
    case "available":
      return LINEAR_WORKTREE_HEALTH_STATES.AVAILABLE;
    case "executing":
      return LINEAR_WORKTREE_HEALTH_STATES.EXECUTING;
    case "dirty_owned":
    case "dirty_orphaned":
    case "validation_failed_repairable":
    case "commit_failed_repairable":
    case "branch_push_failed_repairable":
    case "integration_failed_repairable":
      return LINEAR_WORKTREE_HEALTH_STATES.DIRTY_REPAIRABLE;
    case "integration_blocked":
    case "commit_failed_blocked":
      return LINEAR_WORKTREE_HEALTH_STATES.INTEGRATION_BLOCKED;
    case "diverged":
      return LINEAR_WORKTREE_HEALTH_STATES.DIVERGED;
    case "quarantined":
      return LINEAR_WORKTREE_HEALTH_STATES.QUARANTINED;
    case "missing":
    case "blocked":
    case "unavailable":
      return LINEAR_WORKTREE_HEALTH_STATES.UNAVAILABLE;
    default:
      return LINEAR_WORKTREE_HEALTH_STATES.AVAILABLE;
  }
}

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
