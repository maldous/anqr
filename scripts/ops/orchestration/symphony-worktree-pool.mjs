#!/usr/bin/env node

/**
 * symphony-worktree-pool.mjs — Worktree pool management for concurrent Symphony execution
 *
 * Enables parallel Symphony runner instances by managing git worktrees.
 * Each worktree operates independently with its own working directory,
 * while sharing the git object store for efficiency.
 *
 * Usage:
 *   node scripts/ops/symphony-worktree-pool.mjs init [count]  # Create worktree pool
 *   node scripts/ops/symphony-worktree-pool.mjs cleanup       # Remove all worktrees
 *   node scripts/ops/symphony-worktree-pool.mjs list          # List existing worktrees
 *   node scripts/ops/symphony-worktree-pool.mjs repair        # Repair corrupted worktrees
 */

import { execFileSync } from "node:child_process";
import { existsSync, statfsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createLogger } from "../lib/logger.mjs";
import {
  PROJECT_ROOT,
  WORKTREE_PREFIX,
  WORKTREE_BRANCH_PREFIX,
  getWorktreePath,
  getWorktreeBranch,
} from "../core/worktree-config.mjs";

const { logInfo, logWarn, logError } = createLogger();

/**
 * Create a new worktree for concurrent Symphony execution
 * @param {number} id - Worktree ID (1, 2, 3, ...)
 * @returns {string} - Worktree path
 */
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
        throw new Error(
          `Corrupted worktree path exists and cannot be cleaned up: ${worktreePath}`,
        );
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

/**
 * Remove a worktree
 * @param {number} id - Worktree ID
 */
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

/**
 * List all worktrees
 * @returns {Array<{path: string, branch: string, prunable: boolean, head: string}>}
 */
export function listWorktrees() {
  try {
    const output = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: PROJECT_ROOT,
      encoding: "utf-8",
    });

    const worktrees = [];
    let current = {};
    for (const line of output.split("\n")) {
      if (line.startsWith("worktree ")) {
        if (current.path) worktrees.push(current);
        current = { path: line.slice(9), prunable: false };
      } else if (line.startsWith("HEAD ")) {
        current.head = line.slice(5);
      } else if (line.startsWith("branch ")) {
        current.branch = line.slice(7).replace("refs/heads/", "");
      } else if (line === "prunable") {
        current.prunable = true;
      }
    }
    if (current.path) worktrees.push(current);

    return worktrees;
  } catch (err) {
    logError(`Failed to list worktrees: ${err.message}`);
    return [];
  }
}

/**
 * Get Symphony-specific worktrees only
 * @returns {Array<{id: number, path: string, branch: string, prunable: boolean}>}
 */
export function getSymphonyWorktrees() {
  const allWorktrees = listWorktrees();
  logDebug(`[worktree-pool] getSymphonyWorktrees() - total worktrees: ${allWorktrees.length}`);
  
  const filtered = allWorktrees
    .filter(
      (wt) => wt.path.includes(WORKTREE_PREFIX) && wt.branch?.startsWith(WORKTREE_BRANCH_PREFIX),
    );
  
  logDebug(`[worktree-pool] Worktrees matching Symphony pattern: ${filtered.length}`);
  
  const result = filtered
    .map((wt) => {
      const match = wt.path.match(new RegExp(`${WORKTREE_PREFIX}(\\d+)`));
      const id = match ? Number(match[1]) : null;
      logDebug(`[worktree-pool] Mapped worktree: path=${wt.path}, id=${id}`);
      return {
        id,
        ...wt,
      };
    })
    .filter((wt) => wt.id !== null);
  
  logDebug(`[worktree-pool] Final Symphony worktrees count: ${result.length}`);
  return result;
}

/**
 * Initialize worktree pool
 * @param {number} count - Number of worktrees to create
 */
export async function initWorktreePool(count = 2) {
  logInfo(`🚀 Initializing worktree pool (${count} worktrees)...`);

  // Check if we're in a git repository
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], {
      cwd: PROJECT_ROOT,
      stdio: "pipe",
    });
  } catch {
    logError("Not in a git repository. Cannot create worktrees.");
    process.exit(1);
  }

  // Check available disk space before creating worktrees
  const worktreeParent = resolve(PROJECT_ROOT, "..");
  const stats = statfsSync(worktreeParent);
  const availableBytes = stats.bavail * stats.bsize;
  const availableGB = availableBytes / 1024 ** 3;

  // Estimate space needed: 200MB per worktree + 50MB overhead for shared objects/logs
  const worktreeSizeGB = 0.2;
  const overheadGB = 0.05;
  const requiredGB = count * worktreeSizeGB + overheadGB;

  if (availableGB < requiredGB) {
    const errorMsg = `Insufficient disk space: need ${requiredGB.toFixed(2)}GB, have ${availableGB.toFixed(1)}GB available`;
    logError(errorMsg);
    throw new Error(errorMsg);
  }

  logInfo(
    `✅ Disk space check passed: ${availableGB.toFixed(1)}GB available, ${requiredGB.toFixed(2)}GB required`,
  );

  // Create worktrees
  const created = [];
  for (let i = 1; i <= count; i++) {
    try {
      const path = createWorktree(i);
      created.push({ id: i, path });
    } catch (err) {
      logWarn(`Skipping worktree ${i} due to error: ${err.message}`);
    }
  }

  logInfo(`✅ Worktree pool initialized: ${created.length}/${count} worktrees created`);
  return created;
}

/**
 * Cleanup worktree pool
 */
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

/**
 * Repair corrupted worktrees
 */
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

/**
 * Print worktree status
 */
export function printWorktreeStatus() {
  const allWorktrees = listWorktrees();
  const symphonyWorktrees = getSymphonyWorktrees();

  console.log("\n=== Worktree Status ===\n");
  console.log(`Total worktrees: ${allWorktrees.length}`);
  console.log(`Symphony worktrees: ${symphonyWorktrees.length}\n`);

  if (symphonyWorktrees.length > 0) {
    console.log("Symphony worktrees:");
    for (const wt of symphonyWorktrees) {
      const status = wt.prunable ? "⚠️  PRUNABLE" : "✅ OK";
      console.log(`  [${wt.id}] ${status}`);
      console.log(`      Path:   ${wt.path}`);
      console.log(`      Branch: ${wt.branch}`);
      console.log(`      HEAD:   ${wt.head?.slice(0, 12) || "unknown"}`);
      console.log();
    }
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const cmd = args[0];

  try {
    if (cmd === "init") {
      const count = Number(args[1]) || 2;
      await initWorktreePool(count);
    } else if (cmd === "cleanup") {
      await cleanupWorktreePool();
    } else if (cmd === "list") {
      const worktrees = listWorktrees();
      console.log(JSON.stringify(worktrees, null, 2));
    } else if (cmd === "status") {
      printWorktreeStatus();
    } else if (cmd === "repair") {
      await repairWorktrees();
    } else {
      console.error("Usage: symphony-worktree-pool.mjs <command> [args]");
      console.error("");
      console.error("Commands:");
      console.error("  init [count]   - Create worktree pool (default: 2 worktrees)");
      console.error("  cleanup        - Remove all Symphony worktrees");
      console.error("  list           - List all worktrees (JSON output)");
      console.error("  status         - Show worktree status (human-readable)");
      console.error("  repair         - Repair corrupted worktrees");
      process.exit(2);
    }
  } catch (err) {
    logError(`Command failed: ${err.message}`);
    process.exit(1);
  }
}
