import { describe, it, expect, vi, beforeEach } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, statfsSync } from "node:fs";

// Mock node modules
vi.mock("node:child_process");
vi.mock("node:fs");
vi.mock("../../../scripts/ops/lib/logger.mjs", () => ({
  createLogger: () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }),
}));
vi.mock("../../../scripts/ops/core/worktree-config.mjs", () => ({
  PROJECT_ROOT: "/mock/project",
  WORKTREE_PREFIX: "anqr-wt",
  WORKTREE_BRANCH_PREFIX: "symphony/wt",
  getWorktreePath: (id: number) => `/mock/project/../anqr-wt${id}`,
  getWorktreeBranch: (id: number) => `symphony/wt${id}`,
}));

describe("symphony-worktree-pool disk space checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should check disk space before creating worktrees", async () => {
    const { initWorktreePool } = await import(
      "../../../scripts/ops/orchestration/symphony-worktree-pool.mjs"
    );

    // Mock git repository check
    vi.mocked(execFileSync).mockReturnValueOnce(Buffer.from(".git"));

    // Mock sufficient disk space (5 GB available)
    vi.mocked(statfsSync).mockReturnValue({
      bavail: 5 * 1024 * 1024 * 1024 / 4096, // 5 GB in blocks
      bsize: 4096, // 4KB block size
      blocks: 0,
      bfree: 0,
      files: 0,
      ffree: 0,
      type: 0,
    } as any);

    // Mock worktree doesn't exist
    vi.mocked(existsSync).mockReturnValue(false);

    // Mock worktree creation
    vi.mocked(execFileSync).mockImplementation((cmd, args) => {
      if (cmd === "git" && args?.[0] === "worktree") {
        return Buffer.from("worktree created");
      }
      if (cmd === "npm" && args?.[0] === "install") {
        return Buffer.from("installed");
      }
      return Buffer.from("");
    });

    await initWorktreePool(2);

    // Verify statfsSync was called to check disk space
    expect(statfsSync).toHaveBeenCalled();
  });

  it("should throw error when insufficient disk space", async () => {
    const { initWorktreePool } = await import(
      "../../../scripts/ops/orchestration/symphony-worktree-pool.mjs"
    );

    // Mock git repository check
    vi.mocked(execFileSync).mockReturnValueOnce(Buffer.from(".git"));

    // Mock insufficient disk space (0.1 GB available, need ~0.45 GB for 2 worktrees)
    vi.mocked(statfsSync).mockReturnValue({
      bavail: 0.1 * 1024 * 1024 * 1024 / 4096, // 0.1 GB in blocks
      bsize: 4096, // 4KB block size
      blocks: 0,
      bfree: 0,
      files: 0,
      ffree: 0,
      type: 0,
    } as any);

    await expect(initWorktreePool(2)).rejects.toThrow(/Insufficient disk space/);
  });

  it("should calculate required space correctly for multiple worktrees", async () => {
    const { initWorktreePool } = await import(
      "../../../scripts/ops/orchestration/symphony-worktree-pool.mjs"
    );

    // Mock git repository check
    vi.mocked(execFileSync).mockReturnValueOnce(Buffer.from(".git"));

    // Mock exactly enough disk space for 3 worktrees (0.2 GB * 3 + 0.05 GB overhead = 0.65 GB)
    vi.mocked(statfsSync).mockReturnValue({
      bavail: 0.65 * 1024 * 1024 * 1024 / 4096, // 0.65 GB in blocks
      bsize: 4096,
      blocks: 0,
      bfree: 0,
      files: 0,
      ffree: 0,
      type: 0,
    } as any);

    // Mock worktree doesn't exist
    vi.mocked(existsSync).mockReturnValue(false);

    // Mock worktree creation
    vi.mocked(execFileSync).mockImplementation((cmd, args) => {
      if (cmd === "git" && args?.[0] === "worktree") {
        return Buffer.from("worktree created");
      }
      if (cmd === "npm" && args?.[0] === "install") {
        return Buffer.from("installed");
      }
      return Buffer.from("");
    });

    await initWorktreePool(3);

    // Should succeed with exactly enough space
    expect(statfsSync).toHaveBeenCalled();
  });

  it("should provide clear error message with space requirements", async () => {
    const { initWorktreePool } = await import(
      "../../../scripts/ops/orchestration/symphony-worktree-pool.mjs"
    );

    // Mock git repository check
    vi.mocked(execFileSync).mockReturnValueOnce(Buffer.from(".git"));

    // Mock 0.3 GB available
    vi.mocked(statfsSync).mockReturnValue({
      bavail: 0.3 * 1024 * 1024 * 1024 / 4096,
      bsize: 4096,
      blocks: 0,
      bfree: 0,
      files: 0,
      ffree: 0,
      type: 0,
    } as any);

    try {
      await initWorktreePool(5); // Need ~1.05 GB
      expect.fail("Should have thrown error");
    } catch (err: any) {
      // Error message should contain both required and available space
      expect(err.message).toMatch(/need.*GB.*have.*GB/i);
    }
  });
});
