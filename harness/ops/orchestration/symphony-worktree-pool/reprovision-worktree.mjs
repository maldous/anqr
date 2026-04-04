import { PROJECT_ROOT, getWorktreePath } from "../../core/worktree-config.mjs";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

import { createWorktree } from "./create-worktree.mjs";
import { removeWorktree } from "./remove-worktree.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function reprovisionWorktree(id) {
  const worktreePath = getWorktreePath(id);
  logInfo(`[worktree-pool] 🔄 Reprovisioning worktree ${id}...`);

  // Step 1: Force remove existing worktree
  try {
    removeWorktree(id);
  } catch (err) {
    logWarn(`[worktree-pool] Removal failed during reprovision (continuing): ${err.message}`);
    // Try manual cleanup
    try {
      const { rmSync } = await import("node:fs");
      if (existsSync(worktreePath)) {
        rmSync(worktreePath, { recursive: true, force: true });
      }
    } catch {
      /* best effort */
    }
  }

  // Step 2: Prune stale worktree metadata
  try {
    execFileSync("git", ["worktree", "prune"], { cwd: PROJECT_ROOT, stdio: "pipe" });
  } catch {
    /* best effort */
  }

  // Step 3: Recreate from origin/main
  const newPath = createWorktree(id);
  logInfo(`[worktree-pool] ✅ Reprovisioned worktree ${id} at ${newPath}`);
  return newPath;
}
