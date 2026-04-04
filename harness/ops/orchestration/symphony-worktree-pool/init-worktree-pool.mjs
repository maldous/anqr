// Generated from ../../../scripts/ops/orchestration/symphony-worktree-pool.mjs:248

import { execFileSync } from "node:child_process";
import { PROJECT_ROOT } from "../../core/worktree-config.mjs";
import { resolve } from "node:path";
import { statfsSync } from "node:fs";

import { createWorktree } from "./create-worktree.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

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
