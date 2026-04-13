import { LINEAR_WORKTREE_HEALTH_STATES } from "../../../core/linear-worktree-health-states.mjs";

export function normalizeWorktreeState(state) {
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
