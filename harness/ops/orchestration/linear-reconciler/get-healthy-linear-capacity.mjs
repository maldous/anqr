import { getWorktreeState } from "../../symphony-state.mjs";

const LINEAR_WORKTREE_IDS = [1, 2, 3, 4];
const UNHEALTHY_STATES = new Set(["quarantined", "diverged", "unavailable"]);

export function getHealthyLinearCapacity() {
  const worktrees = [];

  for (const id of LINEAR_WORKTREE_IDS) {
    const wtId = `wt${id}`;
    const state = getWorktreeState(wtId);
    const wtState = state?.state || "available";
    const healthy = !UNHEALTHY_STATES.has(wtState);
    worktrees.push({
      id,
      wtId,
      state: wtState,
      healthy,
      executing: wtState === "executing" || wtState === "dirty_owned",
      issueIdentifier: state?.issueIdentifier || null,
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
