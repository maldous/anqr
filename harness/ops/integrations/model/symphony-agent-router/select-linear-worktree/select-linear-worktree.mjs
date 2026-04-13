import { getWorktreeState } from "../../../../core/symphony-state.mjs";
import { LINEAR_WORKTREE_HEALTH_STATES } from "../../../../core/linear-worktree-health-states.mjs";
import { WORKTREES } from "../worktrees.mjs";
import { normalizeWorktreeState } from "./normalize-worktree-state.mjs";

const UNHEALTHY_STATES = new Set([
  LINEAR_WORKTREE_HEALTH_STATES.QUARANTINED,
  LINEAR_WORKTREE_HEALTH_STATES.DIVERGED,
  LINEAR_WORKTREE_HEALTH_STATES.INTEGRATION_BLOCKED,
  LINEAR_WORKTREE_HEALTH_STATES.UNAVAILABLE,
]);

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
