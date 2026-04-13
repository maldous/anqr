import { LINEAR_WORKTREE_HEALTH_STATES } from "../../../../core/linear-worktree-health-states.mjs";

export function normalizeWorktreeState(state) {
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
