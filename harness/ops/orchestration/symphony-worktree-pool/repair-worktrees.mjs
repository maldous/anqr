import { execFileSync } from "node:child_process";
import { PROJECT_ROOT } from "../../core/worktree-config.mjs";

import { listWorktrees } from "./list-worktrees.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function repairWorktrees() {
  logInfo("🔧 Repairing worktrees...");

  try {
    // Run git worktree repair
    execFileSync("git", ["worktree", "repair"], {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    });
    logInfo("✅ Worktrees repaired");
  } catch (err) {
    logError(`Failed to repair worktrees: ${err.message}`);
    throw err;
  }

  // Check for prunable worktrees
  const prunable = listWorktrees().filter((wt) => wt.prunable);
  if (prunable.length > 0) {
    logWarn(`Found ${prunable.length} prunable worktree(s):`);
    for (const wt of prunable) {
      logWarn(`  - ${wt.path} (${wt.branch || "detached"})`);
    }
  }
}
