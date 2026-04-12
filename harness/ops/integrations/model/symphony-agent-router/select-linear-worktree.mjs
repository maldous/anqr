import { getWorktreeState } from "../../../core/symphony-state.mjs";
import { WORKTREES } from "./worktrees.mjs";

const UNHEALTHY_STATES = new Set(["quarantined", "diverged", "unavailable"]);

export function selectLinearWorktree() {
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  if (linearWorktrees.length === 0) return null;

  const healthy = linearWorktrees.filter((w) => {
    const state = getWorktreeState(`wt${w.id}`);
    return !state || !UNHEALTHY_STATES.has(state.state);
  });
  if (healthy.length === 0) return null;

  return [...healthy].sort((a, b) => a.activeRequests - b.activeRequests)[0];
}
