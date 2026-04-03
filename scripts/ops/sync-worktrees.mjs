#!/usr/bin/env node
/**
 * Sync all worktrees to origin/main
 */

import { execSync } from "child_process";

const WORKTREES = ["wt1", "wt2", "wt3", "wt4", "wt5", "wt6", "wt7", "wt8"];

console.log("=== Syncing worktrees to origin/main ===\n");

// Get origin/main commit
const originMain = execSync("git log --oneline -1 origin/main", { cwd: "/home/user/src/anqr" })
  .toString()
  .trim();
console.log(`origin/main: ${originMain}\n`);

for (const wt of WORKTREES) {
  const wtPath = `/home/user/src/anqr-wt${wt.replace("wt", "")}`;
  console.log(`--- ${wt} ---`);

  try {
    // Get current commit
    const before = execSync("git log --oneline -1", { cwd: wtPath }).toString().trim();

    // Fetch and fast-forward
    execSync("git fetch origin main", { cwd: wtPath });
    execSync("git merge origin/main --ff-only", { cwd: wtPath });

    // Get new commit
    const after = execSync("git log --oneline -1", { cwd: wtPath }).toString().trim();

    console.log(`  Before: ${before}`);
    console.log(`  After:  ${after}`);
    console.log(`  Status: ${before === after ? "already at HEAD" : "synced"}\n`);
  } catch (err) {
    console.log(`  Error: ${err.message}\n`);
  }
}

console.log("=== Done ===");
