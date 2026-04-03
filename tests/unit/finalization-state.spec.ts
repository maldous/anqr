/**
 * Test: Finalization state helpers in symphony-state.mjs
 *
 * Covers:
 * - setFinalizationState merges safely
 * - enqueueIntegrationCandidate deduplicates
 * - acquireIntegrationLock is exclusive
 * - getNextRepairableIssueForWorktree returns sticky owner only
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  loadState,
  saveState,
  setFinalizationState,
  getFinalizationState,
  enqueueIntegrationCandidate,
  dequeueIntegrationCandidate,
  listIntegrationCandidates,
  acquireIntegrationLock,
  releaseIntegrationLock,
  getNextRepairableIssueForWorktree,
  listRepairableIssuesForWorktree,
  mutateState,
} from "../../scripts/ops/core/symphony-state.mjs";

// Reset state before each test
beforeEach(() => {
  mutateState((store) => {
    store.issues = {};
    store.global = { integrationQueue: [], integrationLock: null };
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

describe("Integration Queue", () => {
  it("should enqueue candidates", () => {
    enqueueIntegrationCandidate("ANQ-200");
    enqueueIntegrationCandidate("ANQ-201");

    const candidates = listIntegrationCandidates();
    expect(candidates).toEqual(["ANQ-200", "ANQ-201"]);
  });

  it("should deduplicate on enqueue", () => {
    enqueueIntegrationCandidate("ANQ-300");
    enqueueIntegrationCandidate("ANQ-300");
    enqueueIntegrationCandidate("ANQ-300");

    const candidates = listIntegrationCandidates();
    expect(candidates).toEqual(["ANQ-300"]);
  });

  it("should dequeue candidates", () => {
    enqueueIntegrationCandidate("ANQ-400");
    enqueueIntegrationCandidate("ANQ-401");
    dequeueIntegrationCandidate("ANQ-400");

    const candidates = listIntegrationCandidates();
    expect(candidates).toEqual(["ANQ-401"]);
  });

  it("should handle dequeue of non-existent candidate", () => {
    enqueueIntegrationCandidate("ANQ-500");
    dequeueIntegrationCandidate("ANQ-999");

    const candidates = listIntegrationCandidates();
    expect(candidates).toEqual(["ANQ-500"]);
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
    while (Date.now() - start < 10) { /* busy wait */ }

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
});
