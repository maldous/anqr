/**
 * Test: symphony-worktree-recovery.mjs classification logic
 *
 * Tests classification rules and repair action decisions
 * using mock health snapshots (no real worktrees needed).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const inferOwnerFromBranchMock = vi.fn<(snapshot: unknown) => string | null>(() => null);

vi.mock(
  "../../harness/ops/orchestration/symphony-worktree-recovery/infer-owner-from-branch.mjs",
  () => ({
    inferOwnerFromBranch: (snapshot: unknown) => inferOwnerFromBranchMock(snapshot),
  }),
);

import { classifyWorktree } from "../../harness/ops/orchestration/symphony-worktree-recovery.mjs";

function makeSnapshot(overrides = {}) {
  return {
    id: "wt1",
    path: "/home/user/src/anqr-wt1",
    exists: true,
    gitDirtyFiles: [],
    branch: "symphony/wt1",
    headSha: "abc123",
    finalizationState: null,
    leaseState: null,
    classification: "available",
    issueIdentifier: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("classifyWorktree", () => {
  beforeEach(() => {
    inferOwnerFromBranchMock.mockReturnValue(null);
  });

  it("should classify clean worktree as clean/skip", () => {
    const result = classifyWorktree(makeSnapshot());
    expect(result.classification).toBe("clean");
    expect(result.repairAction).toBe("skip");
  });

  it("should classify missing worktree for reprovision", () => {
    const result = classifyWorktree(makeSnapshot({ exists: false }));
    expect(result.classification).toBe("missing");
    expect(result.repairAction).toBe("reprovision");
  });

  it("should classify executing worktree with active lease", () => {
    const result = classifyWorktree(
      makeSnapshot({
        leaseState: {
          owner: "runner",
          heartbeat_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 600_000).toISOString(),
        },
      }),
    );
    expect(result.classification).toBe("executing");
    expect(result.repairAction).toBe("skip");
  });

  it("should classify dirty_owned with repairable finalization", () => {
    const result = classifyWorktree(
      makeSnapshot({
        gitDirtyFiles: ["M src/main.tsx"],
        finalizationState: {
          state: "validation_failed_repairable",
          stickyOwner: "wt1",
          attempts: 1,
          updatedAt: new Date().toISOString(),
        },
      }),
    );
    expect(result.classification).toBe("dirty_owned");
    expect(result.repairAction).toBe("continue_repair");
    expect(result.confidence).toBe(1.0);
  });

  it("should classify stale lease for reclaim", () => {
    const result = classifyWorktree(
      makeSnapshot({
        gitDirtyFiles: ["M src/main.tsx"],
        leaseState: {
          owner: "runner",
          heartbeat_at: new Date(Date.now() - 600_000).toISOString(),
          expires_at: new Date(Date.now() - 300_000).toISOString(),
        },
      }),
    );
    expect(result.classification).toBe("stale_lease");
    expect(result.repairAction).toBe("reclaim_lease");
  });

  it("should classify dirty orphaned with no context as quarantine (ADR-0005)", () => {
    const result = classifyWorktree(
      makeSnapshot({
        gitDirtyFiles: ["M src/main.tsx", "A src/new-file.ts"],
      }),
    );
    expect(result.classification).toBe("dirty_orphaned");
    // reset_to_main discards unfinalized changes and makes worktree available again;
    // avoids a permanent quarantine loop where dirty_orphaned could never auto-recover
    expect(result.repairAction).toBe("reset_to_main");
    expect(result.confidence).toBeLessThan(0.5);
  });

  it("should quarantine after max repair attempts", () => {
    const result = classifyWorktree(
      makeSnapshot({
        gitDirtyFiles: ["M src/main.tsx"],
        finalizationState: {
          state: "commit_failed_repairable",
          stickyOwner: "wt1",
          attempts: 5,
          updatedAt: new Date(Date.now() - 700_000).toISOString(),
        },
      }),
    );
    expect(result.classification).toBe("dirty_owned");
    expect(result.repairAction).toBe("quarantine");
  });

  it("should classify branch_push_failed as half_committed for retry", () => {
    const result = classifyWorktree(
      makeSnapshot({
        finalizationState: {
          state: "branch_push_failed_repairable",
          stickyOwner: "wt1",
          attempts: 1,
          updatedAt: new Date().toISOString(),
        },
        issueIdentifier: "ANQ-100",
      }),
    );
    expect(result.classification).toBe("half_committed");
    expect(result.repairAction).toBe("retry_push");
  });

  it("should skip repairable states belonging to other worktrees", () => {
    const result = classifyWorktree(
      makeSnapshot({
        id: "wt1",
        finalizationState: {
          state: "validation_failed_repairable",
          stickyOwner: "wt2",
          attempts: 1,
          updatedAt: new Date().toISOString(),
        },
      }),
    );
    expect(result.classification).toBe("clean");
    expect(result.repairAction).toBe("skip");
  });
});
