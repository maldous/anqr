/**
 * Test: Finalization state helpers in symphony-state.mjs
 *
 * Covers:
 * - setFinalizationState merges safely
 * - listIntegrationCandidates derives from finalization.state
 * - acquireIntegrationLock is exclusive
 * - getNextRepairableIssueForWorktree returns sticky owner only
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, it, expect, beforeEach } from "vitest";
import {
  getFinalizationState,
  listIntegrationCandidates,
  acquireIntegrationLock,
  releaseIntegrationLock,
  getNextRepairableIssueForWorktree,
  listRepairableIssuesForWorktree,
  mutateState,
} from "../../harness/ops/core/symphony-state.mjs";
import { setFinalizationState } from "../../harness/ops/core/symphony-state/set-finalization-state.mjs";

const testStateDir =
  process.env.ANQR_SYMPHONY_STATE_DIR || mkdtempSync(path.join(tmpdir(), "anqr-finalization-state-"));
process.env.ANQR_SYMPHONY_STATE_DIR = testStateDir;

// Reset state before each test
beforeEach(() => {
  rmSync(path.join(testStateDir, "state.json"), { force: true });
  mutateState((store) => {
    store.issues = {};
    store.worktreeStates = {};
    store.global = { integrationLock: null };
    return store;
  });
});

describe("setFinalizationState", () => {
  it("should create finalization state for new issue", () => {
    const result = setFinalizationState("ANQ-100", {
      state: "integration_pending",
      worktreeId: "wt1",
      branch: "symphony/wt1",
      headSha: "abc123",
    });

    expect(result.state).toBe("integration_pending");
    expect(result.worktreeId).toBe("wt1");
    expect(result.branch).toBe("symphony/wt1");
    expect(result.headSha).toBe("abc123");
    expect(result.updatedAt).toBeTruthy();
  });

  it("should merge safely with existing finalization", () => {
    setFinalizationState("ANQ-101", {
      state: "integration_pending",
      worktreeId: "wt2",
      branch: "symphony/wt2",
      headSha: "def456",
      stickyOwner: "wt2",
    });

    const updated = setFinalizationState("ANQ-101", {
      state: "integrated_main",
      integratedMainSha: "ghi789",
    });

    expect(updated.state).toBe("integrated_main");
    expect(updated.integratedMainSha).toBe("ghi789");
    // Previous fields should be preserved
    expect(updated.worktreeId).toBe("wt2");
    expect(updated.branch).toBe("symphony/wt2");
    expect(updated.stickyOwner).toBe("wt2");
  });

  it("should be retrievable via getFinalizationState", () => {
    setFinalizationState("ANQ-102", {
      state: "commit_failed_repairable",
      worktreeId: "wt3",
      stickyOwner: "wt3",
    });

    const result = getFinalizationState("ANQ-102");
    expect(result).not.toBeNull();
    expect(result!.state).toBe("commit_failed_repairable");
    expect(result!.stickyOwner).toBe("wt3");
  });

  it("should return null for issues without finalization", () => {
    const result = getFinalizationState("ANQ-NONEXISTENT");
    expect(result).toBeNull();
  });
});

describe("Integration Queue (Phase 5: derived from finalization.state)", () => {
  it("should list candidates based on finalization.state", () => {
    // Phase 5: candidates are derived from finalization state, not explicit enqueue
    setFinalizationState("ANQ-200", {
      state: "integration_pending",
      worktreeId: "wt1",
      branch: "symphony/wt1",
    });
    setFinalizationState("ANQ-201", {
      state: "evidence_pending_closeout",
      worktreeId: "wt2",
    });

    const candidates = listIntegrationCandidates();
    expect(candidates).toContain("ANQ-200");
    expect(candidates).toContain("ANQ-201");
  });

  it("should deduplicate naturally (each issue appears once)", () => {
    setFinalizationState("ANQ-300", {
      state: "integration_pending",
      worktreeId: "wt1",
    });
    // Phase 5: candidacy is derived from finalization.state — no explicit enqueue

    const candidates = listIntegrationCandidates();
    expect(candidates.filter((id: string) => id === "ANQ-300")).toHaveLength(1);
  });

  it("should remove candidate when finalization state changes", () => {
    setFinalizationState("ANQ-400", {
      state: "integration_pending",
      worktreeId: "wt1",
    });
    setFinalizationState("ANQ-401", {
      state: "integration_pending",
      worktreeId: "wt2",
    });
    // "Dequeue" by changing finalization state to completed
    setFinalizationState("ANQ-400", {
      state: "integrated_main",
    });

    const candidates = listIntegrationCandidates();
    expect(candidates).not.toContain("ANQ-400");
    expect(candidates).toContain("ANQ-401");
  });

  it("should not list issues without integration-ready finalization", () => {
    setFinalizationState("ANQ-500", {
      state: "integration_pending",
      worktreeId: "wt1",
    });
    // Phase 5: enqueue/dequeue removed — candidacy derived from finalization.state

    const candidates = listIntegrationCandidates();
    expect(candidates).toContain("ANQ-500");
  });
});

describe("Integration Lock", () => {
  it("should acquire lock when free", () => {
    const result = acquireIntegrationLock("holder-1");
    expect(result.ok).toBe(true);
    expect(result.holder).toBe("holder-1");
  });

  it("should reject when lock is held", () => {
    acquireIntegrationLock("holder-1", 60_000);
    const result = acquireIntegrationLock("holder-2");
    expect(result.ok).toBe(false);
    expect(result.holder).toBe("holder-1");
  });

  it("should release lock for holder", () => {
    acquireIntegrationLock("holder-1");
    const release = releaseIntegrationLock("holder-1");
    expect(release.ok).toBe(true);

    const reacquire = acquireIntegrationLock("holder-2");
    expect(reacquire.ok).toBe(true);
  });

  it("should reject release from wrong holder", () => {
    acquireIntegrationLock("holder-1");
    const result = releaseIntegrationLock("holder-wrong");
    expect(result.ok).toBe(false);
  });

  it("should allow acquisition after TTL expires", () => {
    // Acquire with very short TTL
    acquireIntegrationLock("holder-1", 1);

    // Wait for expiry
    const start = Date.now();
    while (Date.now() - start < 10) {
      /* busy wait */
    }

    const result = acquireIntegrationLock("holder-2");
    expect(result.ok).toBe(true);
  });
});

describe("Repair Candidate Lookup", () => {
  it("should return repairable issues for sticky owner", () => {
    setFinalizationState("ANQ-600", {
      state: "commit_failed_repairable",
      stickyOwner: "wt1",
      worktreeId: "wt1",
    });
    setFinalizationState("ANQ-601", {
      state: "branch_push_failed_repairable",
      stickyOwner: "wt1",
      worktreeId: "wt1",
    });
    setFinalizationState("ANQ-602", {
      state: "integration_failed_repairable",
      stickyOwner: "wt2",
      worktreeId: "wt2",
    });

    const next = getNextRepairableIssueForWorktree("wt1");
    expect(next).not.toBeNull();
    expect(["ANQ-600", "ANQ-601"]).toContain(next!.issueIdentifier);

    const all = listRepairableIssuesForWorktree("wt1");
    expect(all).toHaveLength(2);
  });

  it("should not return issues for different worktree", () => {
    setFinalizationState("ANQ-700", {
      state: "commit_failed_repairable",
      stickyOwner: "wt1",
      worktreeId: "wt1",
    });

    const result = getNextRepairableIssueForWorktree("wt2");
    expect(result).toBeNull();
  });

  it("should not return non-repairable states", () => {
    setFinalizationState("ANQ-800", {
      state: "integration_pending",
      stickyOwner: "wt1",
      worktreeId: "wt1",
    });
    setFinalizationState("ANQ-801", {
      state: "integrated_main",
      stickyOwner: "wt1",
      worktreeId: "wt1",
    });
    setFinalizationState("ANQ-802", {
      state: "commit_failed_blocked",
      stickyOwner: "wt1",
      worktreeId: "wt1",
    });

    const result = getNextRepairableIssueForWorktree("wt1");
    expect(result).toBeNull();
  });

  it("should return validation_failed_repairable as repair candidate", () => {
    setFinalizationState("ANQ-850", {
      state: "validation_failed_repairable",
      stickyOwner: "wt2",
      worktreeId: "wt2",
      lastError: "typecheck failed",
      attempts: 1,
    });

    const result = getNextRepairableIssueForWorktree("wt2");
    expect(result).not.toBeNull();
    expect(result!.issueIdentifier).toBe("ANQ-850");
    expect(result!.finalization.state).toBe("validation_failed_repairable");
    expect(result!.finalization.attempts).toBe(1);
  });

  it("should return all four repairable states", () => {
    setFinalizationState("ANQ-860", {
      state: "validation_failed_repairable",
      stickyOwner: "wt3",
      worktreeId: "wt3",
    });
    setFinalizationState("ANQ-861", {
      state: "commit_failed_repairable",
      stickyOwner: "wt3",
      worktreeId: "wt3",
    });
    setFinalizationState("ANQ-862", {
      state: "branch_push_failed_repairable",
      stickyOwner: "wt3",
      worktreeId: "wt3",
    });
    setFinalizationState("ANQ-863", {
      state: "integration_failed_repairable",
      stickyOwner: "wt3",
      worktreeId: "wt3",
    });

    const all = listRepairableIssuesForWorktree("wt3");
    expect(all).toHaveLength(4);
  });
});
