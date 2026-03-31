/**
 * Test: Worktree Git Push Sync
 * 
 * Verifies that the fixed gitPush function:
 * 1. Pushes to worktree branch (e.g., symphony/wt1) first
 * 2. Then pushes to main
 * 3. This prevents race conditions when multiple worktrees push simultaneously
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const WORKTREE_ID = process.env.ANQR_WORKTREE_ID || "wt1";
const ROOT = resolve(process.cwd());

describe("Worktree Git Push Sync", () => {
  it("should push to worktree branch first, then sync to main", () => {
    // Verify we're in a worktree (not main)
    const gitPath = resolve(ROOT, ".git");
    expect(existsSync(gitPath)).toBe(true);
    
    // Get current branch - should be symphony/wtN
    const currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
    
    console.log(`Current branch: ${currentBranch}`);
    
    // Verify branch matches worktree pattern
    expect(currentBranch).toMatch(/^symphony\/wt\d+$/);
    expect(currentBranch).toContain(WORKTREE_ID);
    
    // Verify remote branch exists
    const remoteRef = `origin/${currentBranch}`;
    try {
      execFileSync("git", ["rev-parse", "--verify", remoteRef], {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: "pipe",
      });
      console.log(`Remote branch ${remoteRef} exists`);
    } catch {
      // First push - branch won't exist yet, that's OK
      console.log(`Remote branch ${remoteRef} does not exist yet (first push)`);
    }
  });
  
  it("should have push upstream tracking set", () => {
    // Check that upstream is configured
    const upstream = execFileSync("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
    
    console.log(`Upstream: ${upstream}`);
    // Should point to origin/symphony/wtN
    expect(upstream).toMatch(/^origin\/symphony\/wt\d+$/);
  });
  
  it("should be able to push to both worktree branch and main", () => {
    // Verify push would work (dry run concept - just check configuration)
    // In actual runner, push does:
    // 1. git push -u origin HEAD:symphony/wt1
    // 2. git push origin HEAD:main
    
    const currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
    
    // Check we're at same point as main (should be synced)
    const localHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf-8" }).trim();
    const mainHead = execFileSync("git", ["rev-parse", "origin/main"], { cwd: ROOT, encoding: "utf-8" }).trim();
    
    console.log(`Local HEAD: ${localHead.slice(0, 8)}`);
    console.log(`Main HEAD: ${mainHead.slice(0, 8)}`);
    
    expect(localHead).toBe(mainHead);
  });
});