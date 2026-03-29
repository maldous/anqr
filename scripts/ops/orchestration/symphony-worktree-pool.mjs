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
import { existsSync, statfsSync } from "node:fs";
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

  if (existsSync(worktreePath)) {
    logInfo(`Worktree already exists: ${worktreePath}`);
    return worktreePath;
  }

  try {
    // Create worktree with new branch tracking main
    execFileSync("git", ["worktree", "add", "-b", branchName, worktreePath, "main"], {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    });
    logInfo(`✅ Created worktree: ${worktreePath} (branch: ${branchName})`);

    // Install dependencies in worktree
    logInfo(`📦 Installing dependencies in ${worktreePath}...`);
    execFileSync("npm", ["install"], {
      cwd: worktreePath,
      stdio: "inherit",
    });
    logInfo(`✅ Dependencies installed in worktree ${id}`);

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
        current.branch = line.slice(7);
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
  return allWorktrees
    .filter(
      (wt) =>
        wt.path.includes(WORKTREE_PREFIX) && wt.branch?.startsWith(WORKTREE_BRANCH_PREFIX),
    )
    .map((wt) => {
      const match = wt.path.match(new RegExp(`${WORKTREE_PREFIX}(\\d+)`));
      return {
        id: match ? Number(match[1]) : null,
        ...wt,
      };
    })
    .filter((wt) => wt.id !== null);
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
  const availableGB = availableBytes / (1024 ** 3);
  
  // Estimate space needed: 200MB per worktree + 50MB overhead for shared objects/logs
  const worktreeSizeGB = 0.2;
  const overheadGB = 0.05;
  const requiredGB = (count * worktreeSizeGB) + overheadGB;
  
  if (availableGB < requiredGB) {
    const errorMsg = `Insufficient disk space: need ${requiredGB.toFixed(2)}GB, have ${availableGB.toFixed(1)}GB available`;
    logError(errorMsg);
    throw new Error(errorMsg);
  }
  
  logInfo(`✅ Disk space check passed: ${availableGB.toFixed(1)}GB available, ${requiredGB.toFixed(2)}GB required`);

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
