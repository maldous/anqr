import { PROJECT_ROOT, getWorktreePath, getWorktreeBranch } from "../../core/worktree-config.mjs";
import { existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { listWorktrees } from "./list-worktrees.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export function createWorktree(id) {
  const worktreePath = getWorktreePath(id);
  const branchName = getWorktreeBranch(id);

  logDebug(`[worktree-pool] createWorktree(${id}) called`);
  logDebug(`[worktree-pool] Calculated worktreePath: ${worktreePath}`);
  logDebug(`[worktree-pool] Calculated branchName: ${branchName}`);
  logDebug(`[worktree-pool] PROJECT_ROOT: ${PROJECT_ROOT}`);

  if (existsSync(worktreePath)) {
    // Path exists - verify it's a valid registered worktree
    const worktrees = listWorktrees();
    const isRegistered = worktrees.some((wt) => wt.path === worktreePath);

    if (isRegistered) {
      logInfo(`Worktree already exists and is registered: ${worktreePath}`);
      return worktreePath;
    } else {
      logWarn(
        `Path exists but is not a registered worktree: ${worktreePath}. Attempting cleanup and recreation.`,
      );

      // Try to remove from git's worktree list if it exists there
      try {
        execFileSync("git", ["worktree", "remove", worktreePath, "--force"], {
          cwd: PROJECT_ROOT,
          stdio: "pipe",
        });
        logInfo(`Removed corrupted worktree from git: ${worktreePath}`);
      } catch {
        // Worktree not in git's list, that's expected for corrupted state
        logInfo(`Worktree not in git registry (expected for corrupted state)`);
      }

      // Remove the directory if it still exists
      try {
        rmSync(worktreePath, { recursive: true, force: true });
        logInfo(`Removed corrupted directory: ${worktreePath}`);
      } catch (err) {
        logError(`Failed to remove corrupted directory: ${err.message}`);
        throw new Error(`Corrupted worktree path exists and cannot be cleaned up: ${worktreePath}`);
      }

      // Fall through to create fresh worktree
      logInfo(`Recreating worktree ${id} after cleanup...`);
    }
  }

  try {
    // Prefer a fresh origin/main baseline so newly-created worktrees do not
    // inherit stale local main state.
    let baseRef = "main";
    try {
      execFileSync("git", ["fetch", "origin", "main"], {
        cwd: PROJECT_ROOT,
        stdio: "pipe",
      });
      execFileSync("git", ["rev-parse", "--verify", "origin/main"], {
        cwd: PROJECT_ROOT,
        stdio: "pipe",
      });
      baseRef = "origin/main";
    } catch (err) {
      logWarn(
        `Could not refresh origin/main for worktree ${id}; falling back to local main: ${err.message}`,
      );
    }

    // Create worktree with new branch tracking the freshest available mainline ref.
    execFileSync("git", ["worktree", "add", "-b", branchName, worktreePath, baseRef], {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    });
    logInfo(`✅ Created worktree: ${worktreePath} (branch: ${branchName}, base: ${baseRef})`);
    logDebug(`[worktree-pool] Git worktree creation successful`);

    // Install dependencies in worktree
    logInfo(`📦 Installing dependencies in ${worktreePath}...`);
    logDebug(`[worktree-pool] Executing: npm install (cwd: ${worktreePath})`);
    execFileSync("npm", ["install"], {
      cwd: worktreePath,
      stdio: "inherit",
    });
    logInfo(`✅ Dependencies installed in worktree ${id}`);
    logDebug(`[worktree-pool] npm install completed successfully`);

    // Set upstream tracking branch so future pushes work
    try {
      execFileSync("git", ["push", "-u", "origin", `HEAD:${branchName}`], {
        cwd: worktreePath,
        stdio: "pipe",
      });
      logInfo(`✅ Set upstream for ${branchName}`);
    } catch (err) {
      logWarn(`⚠️ Failed to set upstream for ${branchName}: ${err.message}`);
    }

    // Verify worktree structure
    logDebug(`[worktree-pool] Verifying worktree structure...`);
    const nodeModulesPath = resolve(worktreePath, "node_modules");
    const packageJsonPath = resolve(worktreePath, "package.json");
    logDebug(`[worktree-pool] node_modules exists: ${existsSync(nodeModulesPath)}`);
    logDebug(`[worktree-pool] package.json exists: ${existsSync(packageJsonPath)}`);

    return worktreePath;
  } catch (err) {
    logError(`Failed to create worktree ${id}: ${err.message}`);
    throw err;
  }
}
