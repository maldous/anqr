import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Workstream B Phase 6 — Claim/lease/assignment lifecycle tests.
 *
 * Exercises the complete issue lifecycle through the transition API layer,
 * proving bidirectional ownership consistency at every step:
 *
 * 1. claimAndAssignWorktree atomicity: both sides set or neither
 * 2. acquireLease: claimed → executing
 * 3. Full lifecycle: claim → execute → push → integration → evidence → complete
 * 4. Bidirectional consistency: issue and worktree agree at every step
 * 5. releaseLease atomicity: both sides cleared
 * 6. Integration candidacy through lifecycle
 * 7. Worktree release doesn't affect integration candidacy
 *
 * Mocking strategy: identical to Phase 2/3/4/5 — mock only I/O (save/load/lock/
 * host/time); let all pure logic run for real.
 */

// ---------------------------------------------------------------------------
// Shared in-memory state store (simulates disk)
// ---------------------------------------------------------------------------

let rawStateOnDisk: Record<string, unknown> = {};

const { normalizeRecord } =
  await import("../../harness/ops/core/symphony-state/normalize-record.mjs");

// ---------------------------------------------------------------------------
// Mock I/O and infrastructure — let all pure logic run for real
// ---------------------------------------------------------------------------

vi.mock("../../harness/ops/core/symphony-state/save-state.mjs", () => ({
  saveState: (store: unknown) => {
    rawStateOnDisk = JSON.parse(JSON.stringify(store));
  },
}));

vi.mock("../../harness/ops/core/symphony-state/load-state.mjs", () => ({
  loadState: () => {
    const data = JSON.parse(JSON.stringify(rawStateOnDisk));
    const store = {
      version: data.version || 1,
      updatedAt: data.updatedAt || "",
      hostId: data.hostId || "test",
      global: {
        integrationLock: null,
        ...data.global,
      },
      issues: {} as Record<string, unknown>,
      worktreeStates: data.worktreeStates || {},
    };
    for (const [key, value] of Object.entries(data.issues || {})) {
      store.issues[key] = normalizeRecord({
        ...(value as object),
        issueIdentifier: key,
      });
    }
    return store;
  },
}));

vi.mock("../../harness/ops/core/symphony-state/with-state-lock.mjs", () => ({
  withStateLock: <T>(fn: () => T): T => fn(),
}));

vi.mock("../../harness/ops/core/symphony-state/host-id.mjs", () => ({
  HOST_ID: "test-host",
}));

vi.mock("../../harness/ops/core/symphony-state/now-iso.mjs", () => ({
  nowIso: () => "2026-04-15T12:00:00.000Z",
}));

vi.mock("../../harness/ops/core/symphony-state/default-lease-ms.mjs", () => ({
  DEFAULT_LEASE_MS: 1_200_000,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyStore() {
  return {
    version: 1,
    updatedAt: "",
    hostId: "test",
    global: { integrationLock: null },
    issues: {} as Record<string, unknown>,
    worktreeStates: {} as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// 1. claimAndAssignWorktree atomicity
// ---------------------------------------------------------------------------

describe("claimAndAssignWorktree atomicity (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should set both issue claimed and worktree executing atomically", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { inferExecutionPhase } =
      await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");

    const result = claimAndAssignWorktree("ANQ-ATOM-1", { worktreeId: "wt1" });
    expect(result.ok).toBe(true);

    // Issue side: claimed with assignment and lease
    const issue = getIssueState("ANQ-ATOM-1");
    expect(inferExecutionPhase(issue)).toBe("claimed");
    expect(issue.assignment?.worktreeId).toBe("wt1");
    expect(issue.lease).toBeTruthy();
    expect(issue.lease?.owner).toBe("scheduler");

    // Worktree side: executing with assignment
    const wt = getWorktreeState("wt1");
    expect(wt.state).toBe("executing");
    expect(wt.assignedIssue).toBe("ANQ-ATOM-1");
  });

  it("should set neither side when worktree is unavailable", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { inferExecutionPhase } =
      await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");

    // Occupy wt1 first
    claimAndAssignWorktree("ANQ-EXISTING", { worktreeId: "wt1" });

    // Attempt to claim wt1 for a different issue
    const result = claimAndAssignWorktree("ANQ-ATOM-2", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("worktree_unavailable");

    // Issue side: ANQ-ATOM-2 was never claimed
    const issue = getIssueState("ANQ-ATOM-2");
    expect(inferExecutionPhase(issue)).toBe("eligible");
    expect(issue.lease).toBeNull();
    expect(issue.assignment).toBeNull();

    // Worktree side: still owned by original issue
    const wt = getWorktreeState("wt1");
    expect(wt.assignedIssue).toBe("ANQ-EXISTING");
  });

  it("should set neither side when issue is not eligible", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Claim issue first (eligible → claimed)
    claimAndAssignWorktree("ANQ-ATOM-3", { worktreeId: "wt1" });

    // Attempt to re-claim same issue for wt2 — should fail (already claimed)
    const result = claimAndAssignWorktree("ANQ-ATOM-3", { worktreeId: "wt2" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("already_claimed");

    // wt2 was NOT changed
    const wt2 = getWorktreeState("wt2");
    expect(wt2).toBeNull();
  });

  it("should reject missing worktreeId", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");

    const result = claimAndAssignWorktree("ANQ-ATOM-4", {});
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("missing_worktree_assignment");
  });
});

// ---------------------------------------------------------------------------
// 2. acquireLease: claimed → executing
// ---------------------------------------------------------------------------

describe("acquireLease transition (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should transition issue from claimed to executing", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");
    const { inferExecutionPhase } =
      await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");

    claimAndAssignWorktree("ANQ-LEASE-1", { worktreeId: "wt1" });
    expect(inferExecutionPhase(getIssueState("ANQ-LEASE-1"))).toBe("claimed");

    const lease = acquireLease("ANQ-LEASE-1", { runId: "run-001" });
    expect(lease.ok).toBe(true);
    expect(lease.lease).toBeTruthy();

    // Now executing (lease has run_id)
    const issue = getIssueState("ANQ-LEASE-1");
    expect(inferExecutionPhase(issue)).toBe("executing");
    expect(issue.lease?.run_id).toBe("run-001");
  });
});

// ---------------------------------------------------------------------------
// 3. releaseLease atomicity: both sides cleared
// ---------------------------------------------------------------------------

describe("releaseLease bidirectional atomicity (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should clear both issue lease and worktree ownership", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Set up: claim + acquire lease
    claimAndAssignWorktree("ANQ-REL-1", { worktreeId: "wt1" });
    acquireLease("ANQ-REL-1", { runId: "run-r1" });

    // Verify both sides are set
    expect(getIssueState("ANQ-REL-1").lease).toBeTruthy();
    expect(getWorktreeState("wt1").state).toBe("executing");
    expect(getWorktreeState("wt1").assignedIssue).toBe("ANQ-REL-1");

    // Release — should clear both sides
    const release = releaseLease("ANQ-REL-1");
    expect(release.ok).toBe(true);
    expect(release.released).toBe(true);

    // Issue side: lease cleared
    expect(getIssueState("ANQ-REL-1").lease).toBeNull();

    // Worktree side: available and unassigned
    const wt = getWorktreeState("wt1");
    expect(wt.state).toBe("available");
    expect(wt.assignedIssue).toBeNull();
  });

  it("should not clear worktree if re-assigned to a different issue", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Issue A claims wt1
    claimAndAssignWorktree("ANQ-REL-A", { worktreeId: "wt1" });
    acquireLease("ANQ-REL-A", { runId: "run-a" });

    // Issue A finishes, worktree released manually
    transitionIssue("ANQ-REL-A", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
      lease: null,
      reason: "push_success",
    });
    transitionWorktree("wt1", "available", { assignedIssue: null });

    // Issue B claims wt1
    claimAndAssignWorktree("ANQ-REL-B", { worktreeId: "wt1" });

    // Now try to release Issue A's lease (it's already null, but the
    // assignment.worktreeId still points to wt1)
    const release = releaseLease("ANQ-REL-A");
    // No lease to release
    expect(release.ok).toBe(true);
    expect(release.released).toBe(false);

    // wt1 should still be owned by Issue B
    const wt = getWorktreeState("wt1");
    expect(wt.state).toBe("executing");
    expect(wt.assignedIssue).toBe("ANQ-REL-B");
  });
});

// ---------------------------------------------------------------------------
// 4. Full lifecycle: claim → execute → push → integration → evidence → complete
// ---------------------------------------------------------------------------

describe("Full lifecycle through transition helpers (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should maintain bidirectional consistency through complete lifecycle", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");
    const { inferExecutionPhase } =
      await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");
    const { listIntegrationCandidates } =
      await import("../../harness/ops/core/symphony-state/list-integration-candidates.mjs");

    // Step 1: Scheduler claims issue and assigns worktree
    const claim = claimAndAssignWorktree("ANQ-FULL", { worktreeId: "wt1" });
    expect(claim.ok).toBe(true);
    expect(inferExecutionPhase(getIssueState("ANQ-FULL"))).toBe("claimed");
    expect(getWorktreeState("wt1").state).toBe("executing");
    expect(getWorktreeOwner("wt1")).toBe("ANQ-FULL");

    // Step 2: Runner acquires lease (claimed → executing)
    const lease = acquireLease("ANQ-FULL", { runId: "run-full" });
    expect(lease.ok).toBe(true);
    expect(inferExecutionPhase(getIssueState("ANQ-FULL"))).toBe("executing");
    // Worktree still executing, still owned
    expect(getWorktreeState("wt1").state).toBe("executing");
    expect(getWorktreeOwner("wt1")).toBe("ANQ-FULL");

    // Not yet an integration candidate
    expect(listIntegrationCandidates()).not.toContain("ANQ-FULL");

    // Step 3: Execution complete, push success → integration_pending
    const push = transitionIssue("ANQ-FULL", "integration_pending", {
      finalization: {
        state: "integration_pending",
        branch: "symphony/wt1",
        worktreeId: "wt1",
      },
      lease: null,
      reason: "push_success",
    });
    expect(push.ok).toBe(true);
    expect(inferExecutionPhase(getIssueState("ANQ-FULL"))).toBe("integration_pending");

    // Now an integration candidate
    expect(listIntegrationCandidates()).toContain("ANQ-FULL");

    // Step 4: Release worktree (runner is done with it)
    const wtRelease = transitionWorktree("wt1", "available", { assignedIssue: null });
    expect(wtRelease.ok).toBe(true);
    expect(getWorktreeState("wt1").state).toBe("available");
    expect(getWorktreeOwner("wt1")).toBeNull();

    // Integration candidacy PERSISTS after worktree release
    expect(listIntegrationCandidates()).toContain("ANQ-FULL");

    // Step 5: Integrator processes — evidence_pending
    const integrate = transitionIssue("ANQ-FULL", "evidence_pending", {
      finalization: {
        state: "evidence_pending_closeout",
        integratedMainSha: "abc123",
      },
      reason: "integration_success",
    });
    expect(integrate.ok).toBe(true);
    expect(inferExecutionPhase(getIssueState("ANQ-FULL"))).toBe("evidence_pending");
    // Still a candidate (evidence_pending_closeout is integration-ready)
    expect(listIntegrationCandidates()).toContain("ANQ-FULL");

    // Step 6: Evidence published → completed
    const complete = transitionIssue("ANQ-FULL", "completed", {
      finalization: { state: "integrated_main" },
      completed_at: new Date().toISOString(),
      reason: "evidence_published",
    });
    expect(complete.ok).toBe(true);
    expect(inferExecutionPhase(getIssueState("ANQ-FULL"))).toBe("completed");

    // No longer an integration candidate
    expect(listIntegrationCandidates()).not.toContain("ANQ-FULL");
  });

  it("should handle parallel claims on different worktrees", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");

    // Claim 3 issues on 3 different worktrees
    expect(claimAndAssignWorktree("ANQ-PAR-1", { worktreeId: "wt1" }).ok).toBe(true);
    expect(claimAndAssignWorktree("ANQ-PAR-2", { worktreeId: "wt2" }).ok).toBe(true);
    expect(claimAndAssignWorktree("ANQ-PAR-3", { worktreeId: "wt3" }).ok).toBe(true);

    // All worktrees correctly owned
    expect(getWorktreeOwner("wt1")).toBe("ANQ-PAR-1");
    expect(getWorktreeOwner("wt2")).toBe("ANQ-PAR-2");
    expect(getWorktreeOwner("wt3")).toBe("ANQ-PAR-3");
    expect(getWorktreeOwner("wt4")).toBeNull();

    // All worktrees executing
    expect(getWorktreeState("wt1").state).toBe("executing");
    expect(getWorktreeState("wt2").state).toBe("executing");
    expect(getWorktreeState("wt3").state).toBe("executing");
    expect(getWorktreeState("wt4")).toBeNull();

    // 4th claim on wt4 succeeds
    expect(claimAndAssignWorktree("ANQ-PAR-4", { worktreeId: "wt4" }).ok).toBe(true);
    expect(getWorktreeOwner("wt4")).toBe("ANQ-PAR-4");
  });

  it("should handle failure path: execution fails, lease released, worktree freed", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { inferExecutionPhase } =
      await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");

    // Claim and acquire lease
    claimAndAssignWorktree("ANQ-FAIL", { worktreeId: "wt1" });
    acquireLease("ANQ-FAIL", { runId: "run-fail" });

    // Dispatch fails → release lease (same as schedule-cycle.mjs)
    const release = releaseLease("ANQ-FAIL");
    expect(release.ok).toBe(true);
    expect(release.released).toBe(true);

    // Issue is back to eligible (lease cleared, no blocking conditions)
    expect(inferExecutionPhase(getIssueState("ANQ-FAIL"))).toBe("eligible");
    expect(getIssueState("ANQ-FAIL").lease).toBeNull();

    // Worktree is available
    const wt = getWorktreeState("wt1");
    expect(wt.state).toBe("available");
    expect(wt.assignedIssue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. Integration candidacy ownership tests
// ---------------------------------------------------------------------------

describe("Integration candidacy through ownership changes (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should derive candidates from finalization state independent of worktree ownership", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const { listIntegrationCandidates } =
      await import("../../harness/ops/core/symphony-state/list-integration-candidates.mjs");
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");

    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");

    // Issue A: claim → execute → push → integration_pending → release worktree
    claimAndAssignWorktree("ANQ-CAND-A", { worktreeId: "wt1" });
    acquireLease("ANQ-CAND-A", { runId: "run-ca" });
    transitionIssue("ANQ-CAND-A", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt1", worktreeId: "wt1" },
      lease: null,
      reason: "push_success",
    });
    // Explicitly release worktree (same as execute-issue.mjs production path —
    // lease is already null from the transitionIssue call above)
    transitionWorktree("wt1", "available", { assignedIssue: null });

    // Issue B: claim same worktree for new work
    claimAndAssignWorktree("ANQ-CAND-B", { worktreeId: "wt1" });

    // Issue A is still an integration candidate (finalization state drives this)
    expect(listIntegrationCandidates()).toContain("ANQ-CAND-A");

    // wt1 is now owned by Issue B
    expect(getWorktreeOwner("wt1")).toBe("ANQ-CAND-B");

    // Issue B is NOT a candidate yet
    expect(listIntegrationCandidates()).not.toContain("ANQ-CAND-B");
  });

  it("should show multiple candidates from different worktrees", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const { listIntegrationCandidates } =
      await import("../../harness/ops/core/symphony-state/list-integration-candidates.mjs");

    // Push two issues to integration_pending from different worktrees
    claimAndAssignWorktree("ANQ-M1", { worktreeId: "wt1" });
    acquireLease("ANQ-M1", { runId: "run-m1" });
    transitionIssue("ANQ-M1", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
      lease: null,
      reason: "push_success",
    });

    claimAndAssignWorktree("ANQ-M2", { worktreeId: "wt2" });
    acquireLease("ANQ-M2", { runId: "run-m2" });
    transitionIssue("ANQ-M2", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt2" },
      lease: null,
      reason: "push_success",
    });

    const candidates = listIntegrationCandidates();
    expect(candidates).toHaveLength(2);
    expect(candidates).toContain("ANQ-M1");
    expect(candidates).toContain("ANQ-M2");
  });
});
