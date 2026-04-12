import { getWorktreeState } from "../../../core/symphony-state.mjs";
import {
  LINEAR_WORKTREE_HEALTH_STATES,
} from "../../../orchestration/linear-reconciler/get-healthy-linear-capacity.mjs";
import { WORKTREES } from "./worktrees.mjs";

const UNHEALTHY_STATES = new Set([
  LINEAR_WORKTREE_HEALTH_STATES.QUARANTINED,
  LINEAR_WORKTREE_HEALTH_STATES.DIVERGED,
  LINEAR_WORKTREE_HEALTH_STATES.INTEGRATION_BLOCKED,
  LINEAR_WORKTREE_HEALTH_STATES.UNAVAILABLE,
]);

function normalizeWorktreeState(state) {
  switch (state) {
    case "dirty_owned":
    case "dirty_orphaned":
    case "validation_failed_repairable":
    case "commit_failed_repairable":
    case "branch_push_failed_repairable":
    case "integration_failed_repairable":
      return LINEAR_WORKTREE_HEALTH_STATES.DIRTY_REPAIRABLE;
    case "blocked":
    case "missing":
      return LINEAR_WORKTREE_HEALTH_STATES.UNAVAILABLE;
    case "commit_failed_blocked":
      return LINEAR_WORKTREE_HEALTH_STATES.INTEGRATION_BLOCKED;
    default:
      return state || LINEAR_WORKTREE_HEALTH_STATES.AVAILABLE;
  }
}

export function selectLinearWorktree() {
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  if (linearWorktrees.length === 0) return null;

  const healthy = linearWorktrees.filter((w) => {
    const state = getWorktreeState(`wt${w.id}`);
    const classification = normalizeWorktreeState(state?.state);
    return !UNHEALTHY_STATES.has(classification);
  });
  if (healthy.length === 0) return null;

  return [...healthy].sort((a, b) => a.activeRequests - b.activeRequests)[0];
}
