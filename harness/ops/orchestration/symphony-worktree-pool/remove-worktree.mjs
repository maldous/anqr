// Generated from ../../../scripts/ops/orchestration/symphony-worktree-pool.mjs:151

import { PROJECT_ROOT, getWorktreePath, getWorktreeBranch } from "../../core/worktree-config.mjs";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function removeWorktree(id) {
  const worktreePath = getWorktreePath(id);
  const branchName = getWorktreeBranch(id);

  try {
    if (existsSync(worktreePath)) {
      execFileSync("git", ["worktree", "remove", worktreePath, "--force"], {
        cwd: PROJECT_ROOT,
        stdio: "pipe",
      });
      logInfo(`🗑️  Removed worktree directory: ${worktreePath}`);
    }

    // Try to delete branch (may fail if it doesn't exist)
    try {
      execFileSync("git", ["branch", "-D", branchName], {
        cwd: PROJECT_ROOT,
        stdio: "pipe",
      });
      logInfo(`🗑️  Deleted branch: ${branchName}`);
    } catch {
      logWarn(`Branch deletion failed (may not exist): ${branchName}`);
    }
  } catch (err) {
    logError(`Failed to remove worktree ${id}: ${err.message}`);
    throw err;
  }
}
