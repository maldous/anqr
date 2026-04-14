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

  const available = linearWorktrees.filter((w) => {
    const state = getWorktreeState(`wt${w.id}`);
    const classification = normalizeWorktreeState(state?.state);
    if (UNHEALTHY_STATES.has(classification)) return false;
    // Phase 4: Use durable state for availability — worktrees in "executing"
    // state are busy and should not be selected for new work.
    if (classification === LINEAR_WORKTREE_HEALTH_STATES.EXECUTING) return false;
    return true;
  });
  if (available.length === 0) return null;

  // Phase 4: Durable state already filtered out executing worktrees.
  // Use activeRequests as observation tiebreaker for load distribution.
  return [...available].sort((a, b) => a.activeRequests - b.activeRequests)[0];
}
