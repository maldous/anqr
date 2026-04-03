import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  createWorktree,
  removeWorktree,
  listWorktrees,
  getSymphonyWorktrees,
} from "../../scripts/ops/orchestration/symphony-worktree-pool.mjs";
import {
  getWorktreePath,
  getWorktreeBranch,
  PROJECT_ROOT,
} from "../../scripts/ops/core/worktree-config.mjs";

describe("Worktree Concurrency Tests", () => {
  const testWorktreeIds = [901, 902]; // Use high IDs to avoid conflicts with production worktrees
  const createdWorktrees: number[] = [];

  beforeAll(() => {
    console.log("🧪 Setting up worktree concurrency test environment...");
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
  });

  afterAll(() => {
    console.log("🧹 Cleaning up test worktrees...");
    for (const id of createdWorktrees) {
      try {
        removeWorktree(id);
        console.log(`✅ Cleaned up worktree ${id}`);
      } catch (err) {
        console.warn(`⚠️  Failed to clean up worktree ${id}: ${err.message}`);
      }
    }
  });

  describe("Worktree Creation and Isolation", () => {
    it("should create a worktree with unique path and branch", () => {
      const id = testWorktreeIds[0];
      const path = createWorktree(id);
      createdWorktrees.push(id);

      expect(existsSync(path)).toBe(true);
      expect(path).toBe(getWorktreePath(id));

      const worktrees = listWorktrees();
      const created = worktrees.find((wt) => wt.path === path);
      expect(created).toBeDefined();
      expect(created?.branch).toBe(getWorktreeBranch(id));
    });

    it("should create multiple independent worktrees", () => {
      const id = testWorktreeIds[1];
      const path = createWorktree(id);
      createdWorktrees.push(id);

      expect(existsSync(path)).toBe(true);

      const symphonyWorktrees = getSymphonyWorktrees();
      const testWorktrees = symphonyWorktrees.filter((wt) => testWorktreeIds.includes(wt.id));

      expect(testWorktrees.length).toBeGreaterThanOrEqual(2);
    });

    it("should have isolated working directories", () => {
      const wt1Path = getWorktreePath(testWorktreeIds[0]);
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      expect(wt1Path).not.toBe(wt2Path);
      expect(existsSync(wt1Path)).toBe(true);
      expect(existsSync(wt2Path)).toBe(true);
    });

    it("should share git object store", () => {
      const wt1Path = getWorktreePath(testWorktreeIds[0]);
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      const wt1GitFile = resolve(wt1Path, ".git");
      const wt2GitFile = resolve(wt2Path, ".git");

      expect(existsSync(wt1GitFile)).toBe(true);
      expect(existsSync(wt2GitFile)).toBe(true);

      // .git should be a file (pointer to main .git), not a directory
      const wt1GitContent = readFileSync(wt1GitFile, "utf-8");
      const wt2GitContent = readFileSync(wt2GitFile, "utf-8");

      expect(wt1GitContent).toContain("gitdir:");
      expect(wt2GitContent).toContain("gitdir:");
    });
  });

  describe("Concurrent File Modifications", () => {
    it("should allow independent file changes in each worktree", () => {
      const wt1Path = getWorktreePath(testWorktreeIds[0]);
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      // Create unique test files in each worktree
      const testFile1 = resolve(wt1Path, "worktree-test-901.txt");
      const testFile2 = resolve(wt2Path, "worktree-test-902.txt");

      writeFileSync(testFile1, `Test file from worktree ${testWorktreeIds[0]}\n`);
      writeFileSync(testFile2, `Test file from worktree ${testWorktreeIds[1]}\n`);

      expect(existsSync(testFile1)).toBe(true);
      expect(existsSync(testFile2)).toBe(true);

      // Files should be isolated - not visible in other worktree
      expect(existsSync(resolve(wt2Path, "worktree-test-901.txt"))).toBe(false);
      expect(existsSync(resolve(wt1Path, "worktree-test-902.txt"))).toBe(false);
    });

    it("should handle concurrent modifications to different files", () => {
      const wt1Path = getWorktreePath(testWorktreeIds[0]);
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      // Create a shared directory structure
      const sharedDir1 = resolve(wt1Path, "test-concurrent");
      const sharedDir2 = resolve(wt2Path, "test-concurrent");

      mkdirSync(sharedDir1, { recursive: true });
      mkdirSync(sharedDir2, { recursive: true });

      // Write different files in same directory across worktrees
      writeFileSync(resolve(sharedDir1, "file-a.txt"), "Content from WT1\n");
      writeFileSync(resolve(sharedDir2, "file-b.txt"), "Content from WT2\n");

      // Each worktree should only see its own changes
      expect(existsSync(resolve(sharedDir1, "file-a.txt"))).toBe(true);
      expect(existsSync(resolve(sharedDir1, "file-b.txt"))).toBe(false);
      expect(existsSync(resolve(sharedDir2, "file-b.txt"))).toBe(true);
      expect(existsSync(resolve(sharedDir2, "file-a.txt"))).toBe(false);
    });
  });

  describe("Git Operations Isolation", () => {
    it("should have independent git index (staging area)", () => {
      const wt1Path = getWorktreePath(testWorktreeIds[0]);
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      // Stage a file in worktree 1
      const testFile1 = resolve(wt1Path, "staged-test-901.txt");
      writeFileSync(testFile1, "Staged in WT1\n");

      execFileSync("git", ["add", "staged-test-901.txt"], {
        cwd: wt1Path,
        stdio: "pipe",
      });

      // Check git status in each worktree
      const status1 = execFileSync("git", ["status", "--porcelain"], {
        cwd: wt1Path,
        encoding: "utf-8",
      });

      const status2 = execFileSync("git", ["status", "--porcelain"], {
        cwd: wt2Path,
        encoding: "utf-8",
      });

      // WT1 should show staged file
      expect(status1).toContain("staged-test-901.txt");

      // WT2 should not show WT1's staged file
      expect(status2).not.toContain("staged-test-901.txt");
    });

    it("should prevent checking out the same branch in multiple worktrees", () => {
      const wt1Branch = getWorktreeBranch(testWorktreeIds[0]);

      // Try to checkout WT1's branch in WT2
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      expect(() => {
        execFileSync("git", ["checkout", wt1Branch], {
          cwd: wt2Path,
          stdio: "pipe",
        });
      }).toThrow();
    });

    it("should allow independent HEAD positions", () => {
      const wt1Path = getWorktreePath(testWorktreeIds[0]);
      const wt2Path = getWorktreePath(testWorktreeIds[1]);

      // Get current HEAD in each worktree
      const head1 = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: wt1Path,
        encoding: "utf-8",
      }).trim();

      const head2 = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: wt2Path,
        encoding: "utf-8",
      }).trim();

      // Initially they should point to the same commit (both from origin/main)
      expect(head1).toBe(head2);

      // Each should be on a different branch
      const branch1 = execFileSync("git", ["branch", "--show-current"], {
        cwd: wt1Path,
        encoding: "utf-8",
      }).trim();

      const branch2 = execFileSync("git", ["branch", "--show-current"], {
        cwd: wt2Path,
        encoding: "utf-8",
      }).trim();

      expect(branch1).not.toBe(branch2);
      expect(branch1).toBe(getWorktreeBranch(testWorktreeIds[0]));
      expect(branch2).toBe(getWorktreeBranch(testWorktreeIds[1]));
    });
  });

  describe("Worktree State Management", () => {
    it("should list all Symphony worktrees including test worktrees", () => {
      const symphonyWorktrees = getSymphonyWorktrees();
      const testWorktrees = symphonyWorktrees.filter((wt) => testWorktreeIds.includes(wt.id));

      expect(testWorktrees.length).toBe(testWorktreeIds.length);

      for (const wt of testWorktrees) {
        expect(wt.path).toBe(getWorktreePath(wt.id));
        expect(wt.branch).toBe(getWorktreeBranch(wt.id));
        expect(wt.prunable).toBe(false);
      }
    });

    it("should identify worktrees by ID from path", () => {
      const symphonyWorktrees = getSymphonyWorktrees();

      for (const id of testWorktreeIds) {
        const wt = symphonyWorktrees.find((w) => w.id === id);
        expect(wt).toBeDefined();
        expect(wt?.path).toContain(`anqr-wt${id}`);
      }
    });
  });

  describe("Cleanup and Recovery", () => {
    it("should cleanly remove a worktree", () => {
      // Create a temporary worktree for removal test
      const tempId = 903;
      const path = createWorktree(tempId);

      expect(existsSync(path)).toBe(true);

      // Remove it
      removeWorktree(tempId);

      expect(existsSync(path)).toBe(false);

      // Verify it's removed from git's worktree list
      const worktrees = listWorktrees();
      const removed = worktrees.find((wt) => wt.path === path);
      expect(removed).toBeUndefined();
    });

    it("should handle idempotent worktree creation", () => {
      const id = testWorktreeIds[0];
      const path1 = getWorktreePath(id);

      // Worktree already exists from earlier test
      expect(existsSync(path1)).toBe(true);

      // Try creating again - should succeed without error
      const path2 = createWorktree(id);

      expect(path2).toBe(path1);
      expect(existsSync(path2)).toBe(true);
    });
  });

  describe("Current Worktree Information", () => {
    it("should identify the current worktree from environment", () => {
      const worktreeId = process.env.ANQR_WORKTREE_ID;
      const worktreePath = process.env.ANQR_WORKTREE_PATH;

      if (worktreeId && worktreePath) {
        console.log(`📋 Running in worktree: ${worktreeId} at ${worktreePath}`);
        expect(worktreePath).toContain(worktreeId);
      } else {
        console.log("📋 Running in main repository (not a worktree)");
        expect(worktreeId).toBeUndefined();
      }
    });

    it("should display current test worktree details", () => {
      const symphonyWorktrees = getSymphonyWorktrees();
      const testWorktrees = symphonyWorktrees.filter((wt) => testWorktreeIds.includes(wt.id));

      console.log("\n📊 Test Worktree Summary:");
      console.log(`   Total test worktrees: ${testWorktrees.length}`);

      for (const wt of testWorktrees) {
        console.log(`   [${wt.id}] ${wt.path}`);
        console.log(`       Branch: ${wt.branch}`);
        console.log(`       Status: ${wt.prunable ? "⚠️  Prunable" : "✅ OK"}`);
      }
    });
  });
});
