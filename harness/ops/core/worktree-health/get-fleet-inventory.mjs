// Generated from ../../../scripts/ops/core/worktree-health.mjs:209

import { ALL_WORKTREE_IDS } from "./all-worktree-ids.mjs";
import { getWorktreeHealthSnapshot } from "./get-worktree-health-snapshot.mjs";

export function getFleetInventory() {
  const worktrees = [];
  const summary = { available: 0, executing: 0, dirty: 0, quarantined: 0, blocked: 0, missing: 0 };

  for (const id of ALL_WORKTREE_IDS) {
    const snapshot = getWorktreeHealthSnapshot(id);
    worktrees.push(snapshot);

    if (snapshot.classification === "dirty_owned" || snapshot.classification === "dirty_orphaned") {
      summary.dirty++;
    } else if (summary[snapshot.classification] !== undefined) {
      summary[snapshot.classification]++;
    }
  }

  return {
    worktrees,
    summary,
    timestamp: new Date().toISOString(),
  };
}
