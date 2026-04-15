/**
 * Workstream B Phase 5 — Fallback observability proof.
 *
 * Exercises the real `infer-owner-from-branch.mjs` module and proves:
 * 1. Stage 1 (durable): returns owner without warnings when durable state exists
 * 2. Stage 2 (git-log): emits logWarn when durable ownership is absent and
 *    the git-log heuristic finds an issue identifier
 * 3. Stage 3 (reverse-scan): emits logWarn when both durable ownership and
 *    git-log miss but reverse-scan of finalization.worktreeId succeeds
 * 4. No warnings emitted when all stages find nothing
 * 5. Stage 2 failure gracefully falls through to stage 3
 *
 * Mocking strategy: mock the barrel (symphony-state.mjs) and node:child_process
 * using the same proven pattern as recovery-behavioral.spec.ts; let the real
 * inferOwnerFromBranch logic run.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock dependencies — let the real inferOwnerFromBranch logic run
// ---------------------------------------------------------------------------

const mockGetWorktreeOwner = vi.fn();
const mockLoadState = vi.fn();
const mockLogWarn = vi.fn();
const mockExecFileSync = vi.fn();

vi.mock("../../harness/ops/symphony-state.mjs", () => ({
  getWorktreeOwner: (...args: unknown[]) => mockGetWorktreeOwner(...args),
  loadState: (...args: unknown[]) => mockLoadState(...args),
}));

vi.mock("../../harness/ops/orchestration/symphony-worktree-recovery/logger.mjs", () => ({
  logWarn: (...args: unknown[]) => mockLogWarn(...args),
}));

vi.mock("node:child_process", () => {
  const execFileSync = (...args: unknown[]) => mockExecFileSync(...args);
  return { default: { execFileSync }, execFileSync };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("inferOwnerFromBranch fallback observability (Phase 5)", () => {
  const snapshot = { id: "wt3", path: "/home/user/src/anqr-wt3" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWorktreeOwner.mockReturnValue(null);
    mockLoadState.mockReturnValue({ issues: {} });
    mockExecFileSync.mockReturnValue("");
  });

  // -----------------------------------------------------------------------
  // Stage 1: durable ownership — no fallback, no warnings
  // -----------------------------------------------------------------------

  it("returns durable owner without warnings when durable state exists", async () => {
    mockGetWorktreeOwner.mockReturnValue("ANQ-100");

    const { inferOwnerFromBranch } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs");
    const result = inferOwnerFromBranch(snapshot);

    expect(result).toBe("ANQ-100");
    expect(mockLogWarn).not.toHaveBeenCalled();
    // Stage 2 should never be reached
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Stage 2: git-log heuristic — warning emitted
  // -----------------------------------------------------------------------

  it("emits warning when git-log heuristic activates (stage 2)", async () => {
    mockGetWorktreeOwner.mockReturnValue(null);
    mockExecFileSync.mockReturnValue("fix(ANQ-200): repair validation failure\nchore: cleanup\n");

    const { inferOwnerFromBranch } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs");
    const result = inferOwnerFromBranch(snapshot);

    expect(result).toBe("ANQ-200");
    expect(mockLogWarn).toHaveBeenCalledTimes(1);
    expect(mockLogWarn).toHaveBeenCalledWith(
      expect.stringContaining("durable ownership not found for wt3"),
    );
    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining("git-log heuristic"));
  });

  // -----------------------------------------------------------------------
  // Stage 3: reverse-scan fallback — warning emitted
  // -----------------------------------------------------------------------

  it("emits warning when reverse-scan fallback activates (stage 3)", async () => {
    mockGetWorktreeOwner.mockReturnValue(null);
    // git-log returns no ANQ-NNN match
    mockExecFileSync.mockReturnValue("chore: unrelated commit\nfeat: other work\n");
    mockLoadState.mockReturnValue({
      issues: {
        "ANQ-300": {
          finalization: { worktreeId: "wt3", state: "integration_pending" },
        },
      },
    });

    const { inferOwnerFromBranch } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs");
    const result = inferOwnerFromBranch(snapshot);

    expect(result).toBe("ANQ-300");
    expect(mockLogWarn).toHaveBeenCalledTimes(1);
    expect(mockLogWarn).toHaveBeenCalledWith(
      expect.stringContaining("git-log heuristic miss for wt3"),
    );
    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining("issue reverse-scan"));
  });

  // -----------------------------------------------------------------------
  // All stages miss — no warnings, returns null
  // -----------------------------------------------------------------------

  it("returns null with no warnings when all stages find nothing", async () => {
    mockGetWorktreeOwner.mockReturnValue(null);
    mockExecFileSync.mockReturnValue("chore: unrelated commit\n");
    mockLoadState.mockReturnValue({ issues: {} });

    const { inferOwnerFromBranch } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs");
    const result = inferOwnerFromBranch(snapshot);

    expect(result).toBeNull();
    expect(mockLogWarn).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Stage 2 git failure falls through to stage 3
  // -----------------------------------------------------------------------

  it("falls through to stage 3 when git-log throws", async () => {
    mockGetWorktreeOwner.mockReturnValue(null);
    mockExecFileSync.mockImplementation(() => {
      throw new Error("git not available");
    });
    mockLoadState.mockReturnValue({
      issues: {
        "ANQ-400": {
          finalization: {
            worktreeId: "wt3",
            state: "validation_failed_repairable",
          },
        },
      },
    });

    const { inferOwnerFromBranch } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs");
    const result = inferOwnerFromBranch(snapshot);

    expect(result).toBe("ANQ-400");
    expect(mockLogWarn).toHaveBeenCalledTimes(1);
    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining("issue reverse-scan"));
  });

  // -----------------------------------------------------------------------
  // Stage 3 only matches the correct worktreeId
  // -----------------------------------------------------------------------

  it("reverse-scan only matches finalization.worktreeId for the target worktree", async () => {
    mockGetWorktreeOwner.mockReturnValue(null);
    mockExecFileSync.mockReturnValue("");
    mockLoadState.mockReturnValue({
      issues: {
        "ANQ-500": {
          finalization: { worktreeId: "wt7", state: "integration_pending" },
        },
        "ANQ-501": {
          finalization: { worktreeId: "wt3", state: "integration_pending" },
        },
      },
    });

    const { inferOwnerFromBranch } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs");
    const result = inferOwnerFromBranch(snapshot);

    // Should match wt3, not wt7
    expect(result).toBe("ANQ-501");
    expect(mockLogWarn).toHaveBeenCalledTimes(1);
    expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining("ANQ-501"));
  });
});
