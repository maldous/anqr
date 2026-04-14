import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Workstream B Phase 5 — Bidirectional ownership and authority normalization.
 *
 * Tests that:
 * 1. listIntegrationCandidates derives from finalization.state (not persistent array)
 * 2. enqueueIntegrationCandidate is a deprecated no-op
 * 3. dequeueIntegrationCandidate is a deprecated no-op
 * 4. scanForRepairedCandidates is a no-op
 * 5. infer-owner-from-branch checks durable worktree state first
 * 6. Full lifecycle: finalization state drives integration candidacy
 *
 * Mocking strategy: identical to Phase 2/3/4 — mock only I/O (save/load/lock/
 * host/time); let all pure logic run for real.
 */

// ---------------------------------------------------------------------------
// Shared in-memory state store (simulates disk)
// ---------------------------------------------------------------------------

let rawStateOnDisk: Record<string, unknown> = {};

const { normalizeRecord } = await import(
  "../../harness/ops/core/symphony-state/normalize-record.mjs"
);

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
        integrationQueue: [],
        integrationLock: null,
        ...(data.global || {}),
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
    global: { integrationQueue: [], integrationLock: null },
    issues: {} as Record<string, unknown>,
    worktreeStates: {} as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// 1. listIntegrationCandidates derives from finalization.state
// ---------------------------------------------------------------------------

describe("listIntegrationCandidates — derived from finalization.state (Phase 5)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should return empty array when no issues exist", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    expect(listIntegrationCandidates()).toEqual([]);
  });

  it("should return issues with integration_pending finalization state", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    store.issues["ANQ-100"] = {
      issueIdentifier: "ANQ-100",
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
    };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    expect(candidates).toContain("ANQ-100");
  });

  it("should return issues with evidence_pending_closeout finalization state", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    store.issues["ANQ-200"] = {
      issueIdentifier: "ANQ-200",
      finalization: { state: "evidence_pending_closeout", integratedMainSha: "abc123" },
    };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    expect(candidates).toContain("ANQ-200");
  });

  it("should NOT return issues with completed finalization state", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    store.issues["ANQ-300"] = {
      issueIdentifier: "ANQ-300",
      finalization: { state: "integrated_main" },
    };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    expect(candidates).not.toContain("ANQ-300");
  });

  it("should NOT return issues with repairable finalization state", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    store.issues["ANQ-400"] = {
      issueIdentifier: "ANQ-400",
      finalization: { state: "integration_failed_repairable" },
    };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    expect(candidates).not.toContain("ANQ-400");
  });

  it("should NOT return issues without finalization", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    store.issues["ANQ-500"] = { issueIdentifier: "ANQ-500" };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    expect(candidates).toHaveLength(0);
  });

  it("should return multiple candidates from mixed states", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    store.issues["ANQ-A"] = {
      issueIdentifier: "ANQ-A",
      finalization: { state: "integration_pending" },
    };
    store.issues["ANQ-B"] = {
      issueIdentifier: "ANQ-B",
      finalization: { state: "evidence_pending_closeout" },
    };
    store.issues["ANQ-C"] = {
      issueIdentifier: "ANQ-C",
      finalization: { state: "integrated_main" },
    };
    store.issues["ANQ-D"] = { issueIdentifier: "ANQ-D" };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    expect(candidates).toHaveLength(2);
    expect(candidates).toContain("ANQ-A");
    expect(candidates).toContain("ANQ-B");
  });

  it("should ignore persistent integrationQueue array entirely", async () => {
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );
    const store = emptyStore();
    // Old-style: persistent queue has an entry, but issue has no matching finalization
    (store.global as Record<string, unknown>).integrationQueue = ["ANQ-STALE"];
    store.issues["ANQ-STALE"] = {
      issueIdentifier: "ANQ-STALE",
      finalization: { state: "integrated_main" },
    };
    rawStateOnDisk = store;

    const candidates = listIntegrationCandidates();
    // Should NOT contain ANQ-STALE — finalization.state is the authority
    expect(candidates).not.toContain("ANQ-STALE");
  });
});

// ---------------------------------------------------------------------------
// 2. enqueueIntegrationCandidate is a deprecated no-op
// ---------------------------------------------------------------------------

describe("enqueueIntegrationCandidate — deprecated no-op (Phase 5)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should return empty array and not modify state", async () => {
    const { enqueueIntegrationCandidate } = await import(
      "../../harness/ops/core/symphony-state/enqueue-integration-candidate.mjs"
    );
    const before = JSON.parse(JSON.stringify(rawStateOnDisk));
    const result = enqueueIntegrationCandidate("ANQ-NOP");
    expect(result).toEqual([]);
    // State should not have been modified (no new integrationQueue entries)
    expect(rawStateOnDisk).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// 3. dequeueIntegrationCandidate is a deprecated no-op
// ---------------------------------------------------------------------------

describe("dequeueIntegrationCandidate — deprecated no-op (Phase 5)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should return empty array and not modify state", async () => {
    const { dequeueIntegrationCandidate } = await import(
      "../../harness/ops/core/symphony-state/dequeue-integration-candidate.mjs"
    );
    const before = JSON.parse(JSON.stringify(rawStateOnDisk));
    const result = dequeueIntegrationCandidate("ANQ-NOP");
    expect(result).toEqual([]);
    expect(rawStateOnDisk).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// 4. scanForRepairedCandidates is a no-op
// ---------------------------------------------------------------------------

describe("scanForRepairedCandidates — no-op (Phase 5)", () => {
  it("should be callable without error", async () => {
    const { scanForRepairedCandidates } = await import(
      "../../harness/ops/orchestration/symphony-integrator/scan-for-repaired-candidates.mjs"
    );
    // Should not throw
    expect(() => scanForRepairedCandidates()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 5. Full lifecycle: finalization state drives integration candidacy
// ---------------------------------------------------------------------------

describe("Finalization-driven integration lifecycle (Phase 5)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should appear in candidates when finalization transitions to integration_pending", async () => {
    const { transitionIssue } = await import(
      "../../harness/ops/core/symphony-state/transition-issue.mjs"
    );
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { acquireLease } = await import(
      "../../harness/ops/core/symphony-state/acquire-lease.mjs"
    );
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );

    // Step 1: Claim → Execute → Push success → integration_pending
    claimIssue("ANQ-LIFE-1", { worktreeId: "wt1", source: "scheduler" });
    acquireLease("ANQ-LIFE-1", { runId: "run-1" });

    // Before finalization → not a candidate
    expect(listIntegrationCandidates()).not.toContain("ANQ-LIFE-1");

    // Transition to integration_pending (push succeeded)
    transitionIssue("ANQ-LIFE-1", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
      lease: null,
      reason: "push_success",
    });

    // Now it should be a candidate
    expect(listIntegrationCandidates()).toContain("ANQ-LIFE-1");
  });

  it("should leave candidates when finalization transitions to completed", async () => {
    const { transitionIssue } = await import(
      "../../harness/ops/core/symphony-state/transition-issue.mjs"
    );
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { acquireLease } = await import(
      "../../harness/ops/core/symphony-state/acquire-lease.mjs"
    );
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );

    // Set up: claim → execute → integration_pending
    claimIssue("ANQ-LIFE-2", { worktreeId: "wt2", source: "scheduler" });
    acquireLease("ANQ-LIFE-2", { runId: "run-2" });
    transitionIssue("ANQ-LIFE-2", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt2" },
      lease: null,
      reason: "push_success",
    });
    expect(listIntegrationCandidates()).toContain("ANQ-LIFE-2");

    // Integration succeeds → evidence_pending
    transitionIssue("ANQ-LIFE-2", "evidence_pending", {
      finalization: { state: "evidence_pending_closeout", integratedMainSha: "abc123" },
      reason: "integration_success",
    });
    // Still a candidate (evidence_pending_closeout is integration-ready)
    expect(listIntegrationCandidates()).toContain("ANQ-LIFE-2");

    // Evidence published → completed
    transitionIssue("ANQ-LIFE-2", "completed", {
      finalization: { state: "integrated_main" },
      completed_at: new Date().toISOString(),
      reason: "evidence_published",
    });
    // No longer a candidate
    expect(listIntegrationCandidates()).not.toContain("ANQ-LIFE-2");
  });

  it("should handle integration failure → repair → re-appear as candidate", async () => {
    const { transitionIssue } = await import(
      "../../harness/ops/core/symphony-state/transition-issue.mjs"
    );
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { acquireLease } = await import(
      "../../harness/ops/core/symphony-state/acquire-lease.mjs"
    );
    const { listIntegrationCandidates } = await import(
      "../../harness/ops/core/symphony-state/list-integration-candidates.mjs"
    );

    // Set up: claim → execute → integration_pending
    claimIssue("ANQ-LIFE-3", { worktreeId: "wt3", source: "scheduler" });
    acquireLease("ANQ-LIFE-3", { runId: "run-3" });
    transitionIssue("ANQ-LIFE-3", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt3" },
      lease: null,
      reason: "push_success",
    });
    expect(listIntegrationCandidates()).toContain("ANQ-LIFE-3");

    // Integration fails
    transitionIssue("ANQ-LIFE-3", "integration_failed", {
      finalization: { state: "integration_failed_repairable", lastError: "conflict" },
      reason: "cherry_pick_conflict",
    });
    // Failed — not a candidate anymore
    expect(listIntegrationCandidates()).not.toContain("ANQ-LIFE-3");

    // Repair succeeds → back to integration_pending
    transitionIssue("ANQ-LIFE-3", "integration_pending", {
      finalization: { state: "integration_pending" },
      reason: "repair_success",
    });
    // Re-appears as candidate automatically — no explicit enqueue needed
    expect(listIntegrationCandidates()).toContain("ANQ-LIFE-3");
  });
});

// ---------------------------------------------------------------------------
// 6. Durable ownership in worktree health and infer-owner
// ---------------------------------------------------------------------------

describe("Durable ownership authority (Phase 5)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("getWorktreeOwner should return assignedIssue from durable state", async () => {
    const { getWorktreeOwner } = await import(
      "../../harness/ops/core/symphony-state/get-worktree-owner.mjs"
    );
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-OWN-1" };
    rawStateOnDisk = store;

    expect(getWorktreeOwner("wt1")).toBe("ANQ-OWN-1");
  });

  it("getWorktreeOwner should return null for unassigned worktree", async () => {
    const { getWorktreeOwner } = await import(
      "../../harness/ops/core/symphony-state/get-worktree-owner.mjs"
    );
    rawStateOnDisk = emptyStore();
    expect(getWorktreeOwner("wt99")).toBeNull();
  });

  it("getWorktreeOwner should handle backwards-compatible issueIdentifier", async () => {
    const { getWorktreeOwner } = await import(
      "../../harness/ops/core/symphony-state/get-worktree-owner.mjs"
    );
    const store = emptyStore();
    store.worktreeStates["wt2"] = { state: "executing", issueIdentifier: "ANQ-OLD" };
    rawStateOnDisk = store;

    expect(getWorktreeOwner("wt2")).toBe("ANQ-OLD");
  });
});
