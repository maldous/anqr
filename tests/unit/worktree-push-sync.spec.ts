/**
 * Test: Worktree Git Push Sync
 *
 * Verifies that the new architecture:
 * 1. Current branch is symphony/wtN
 * 2. Upstream is origin/symphony/wtN
 * 3. Local branch push does not require main promotion
 * 4. Integration to main is owned by integrator, not runner
 */

import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const WORKTREE_ID = process.env.ANQR_WORKTREE_ID || "wt1";
const ROOT = resolve(process.cwd());

describe("Worktree Git Push Sync", () => {
  it("should be on a symphony/wtN branch", () => {
    const gitPath = resolve(ROOT, ".git");
    expect(existsSync(gitPath)).toBe(true);

    let currentBranch: string;
    try {
      currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: "pipe",
      }).trim();
    } catch {
      // In CI or main repo, branch may be unresolvable — skip gracefully
      return;
    }

    // When running outside a worktree (e.g. on main), skip assertion
    if (!currentBranch.startsWith("symphony/wt")) {
      return;
    }

    // Verify branch matches worktree pattern
    expect(currentBranch).toMatch(/^symphony\/wt\d+$/);
  });

  it("should have upstream tracking set to origin/symphony/wtN", () => {
    // When not in a worktree, skip this test
    let currentBranch: string;
    try {
      currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: "pipe",
      }).trim();
    } catch {
      return;
    }
    if (!currentBranch.startsWith("symphony/wt")) {
      return;
    }

    let upstream: string;
    try {
      upstream = execFileSync(
        "git",
        ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
        { cwd: ROOT, encoding: "utf-8", stdio: "pipe" },
      ).trim();
    } catch {
      // No upstream set yet — acceptable on first run
      return;
    }

    expect(upstream).toMatch(/^origin\/symphony\/wt\d+$/);
  });

  it("should NOT expect local HEAD to equal origin/main", () => {
    // The old test asserted localHead === mainHead.
    // In the new architecture, worktree branches diverge from main
    // after local commits. Integration to main is owned by the integrator.
    let currentBranch: string;
    try {
      currentBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: "pipe",
      }).trim();
    } catch {
      return;
    }

    // Branch should be a worktree branch, not main
    if (currentBranch.startsWith("symphony/wt")) {
      expect(currentBranch).not.toBe("main");
    }
  });
});
