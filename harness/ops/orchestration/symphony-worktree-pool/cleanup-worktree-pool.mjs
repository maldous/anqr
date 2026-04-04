// Generated from ../../../scripts/ops/orchestration/symphony-worktree-pool.mjs:301

import { execFileSync } from "node:child_process";
import { PROJECT_ROOT } from "../../core/worktree-config.mjs";

import { getSymphonyWorktrees } from "./get-symphony-worktrees.mjs";
import { removeWorktree } from "./remove-worktree.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function cleanupWorktreePool() {
  const symphonyWorktrees = getSymphonyWorktrees();

  logInfo(`🧹 Cleaning up ${symphonyWorktrees.length} Symphony worktrees...`);

  for (const wt of symphonyWorktrees) {
    try {
      removeWorktree(wt.id);
    } catch (err) {
      logWarn(`Failed to remove worktree ${wt.id}: ${err.message}`);
    }
  }

  // Prune any stale worktree metadata
  try {
    execFileSync("git", ["worktree", "prune"], {
      cwd: PROJECT_ROOT,
      stdio: "pipe",
    });
    logInfo("🧹 Pruned stale worktree metadata");
  } catch (err) {
    logWarn(`Failed to prune worktrees: ${err.message}`);
  }

  logInfo("✅ Worktree pool cleaned up");
}
