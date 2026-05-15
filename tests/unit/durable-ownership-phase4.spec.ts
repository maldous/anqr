import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Workstream B Phase 4 — Durable ownership authority tests.
 *
 * Tests that durable state is the authority for worktree ownership
 * and availability decisions. Covers:
 *
 * 1. Scheduler sets worktree to "executing" at claim time
 * 2. execute-issue guard: skip transition if already executing
 * 3. reconcileWorktreeCounters syncs transient counters
 * 4. selectLinearWorktree uses durable state for availability
 * 5. getHealthyLinearCapacity uses assignedIssue field
 * 6. Full lifecycle: claim → execute → release → available
 *
 * Mocking strategy: identical to Phase 2/3 — mock only I/O (save/load/lock/
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
// Router-layer mocks (needed by reconcileWorktreeCounters + capacity tests)
// ---------------------------------------------------------------------------

const mockWorktrees = [
  { id: 1, path: "/wt1", port: 4321, activeRequests: 0, failures: 0 },
  { id: 2, path: "/wt2", port: 4322, activeRequests: 0, failures: 0 },
  { id: 3, path: "/wt3", port: 4323, activeRequests: 0, failures: 0 },
  { id: 4, path: "/wt4", port: 4324, activeRequests: 0, failures: 0 },
  { id: 5, path: "/wt5", port: 4325, activeRequests: 0, failures: 0 },
];

vi.mock("../../harness/ops/integrations/model/symphony-agent-router/worktrees.mjs", () => ({
  WORKTREES: mockWorktrees,
}));

vi.mock("../../harness/ops/integrations/model/symphony-agent-router/logger.mjs", () => ({
  logInfo: () => {},
  logWarn: () => {},
  logError: () => {},
  logDebug: () => {},
}));

// The reconciler uses ../../../symphony-state.mjs relative to its location
vi.mock("../../harness/ops/symphony-state.mjs", async () => {
  const actual = (await vi.importActual(
    "../../harness/ops/core/symphony-state/index.mjs",
  )) as Record<string, unknown>;
  return actual;
});

vi.mock("../../harness/ops/core/linear-worktree-health-states.mjs", () => ({
  LINEAR_WORKTREE_HEALTH_STATES: {
    AVAILABLE: "available",
    EXECUTING: "executing",
    DIRTY_REPAIRABLE: "dirty_repairable",
    QUARANTINED: "quarantined",
    DIVERGED: "diverged",
    INTEGRATION_BLOCKED: "integration_blocked",
    UNAVAILABLE: "unavailable",
  },
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
// 1. Scheduler sets worktree to "executing" at claim time
// ---------------------------------------------------------------------------

describe("Scheduler worktree state at claim time (Phase 4)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should allow setting worktree to executing after claiming an issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Claim the issue
    const claim = claimIssue("ANQ-P4-1", { worktreeId: "wt1", source: "scheduler" });
    expect(claim.ok).toBe(true);

    // Scheduler sets worktree to executing at claim time
    const wt = transitionWorktree("wt1", "executing", { assignedIssue: "ANQ-P4-1" });
    expect(wt.ok).toBe(true);
    expect(wt.to).toBe("executing");

    // Verify durable state
    const state = getWorktreeState("wt1");
    expect(state.state).toBe("executing");
    expect(state.assignedIssue).toBe("ANQ-P4-1");
  });

  it("should prevent double-assignment: second claim sees worktree as executing", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // First claim + worktree set
    claimIssue("ANQ-P4-2A", { worktreeId: "wt1", source: "scheduler" });
    transitionWorktree("wt1", "executing", { assignedIssue: "ANQ-P4-2A" });

    // Verify worktree is executing
    const state = getWorktreeState("wt1");
    expect(state.state).toBe("executing");

    // A scheduler capacity check would now see wt1 as executing
    // (simulating what getHealthyLinearCapacity does)
    expect(state.state === "executing").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. execute-issue guard: skip transition if already executing
// ---------------------------------------------------------------------------

describe("execute-issue executing guard (Phase 4)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should not reject executing → executing when guard checks first", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Scheduler sets worktree to executing
    transitionWorktree("wt2", "executing", { assignedIssue: "ANQ-P4-3" });

    // Simulate execute-issue's guarded transition
    const currentState = getWorktreeState("wt2");
    if (!currentState || currentState.state !== "executing") {
      // This should NOT execute — worktree is already executing
      transitionWorktree("wt2", "executing", { assignedIssue: "ANQ-P4-3" });
    }

    // Verify state is still executing (no error thrown)
    const finalState = getWorktreeState("wt2");
    expect(finalState.state).toBe("executing");
    expect(finalState.assignedIssue).toBe("ANQ-P4-3");
  });

  it("should still transition dirty_owned → executing for sticky repair", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Set up dirty_owned worktree (from previous repair)
    const store = emptyStore();
    store.worktreeStates["wt3"] = {
      state: "dirty_owned",
      assignedIssue: "ANQ-P4-4",
    };
    rawStateOnDisk = store;

    // Guarded check: not executing → should transition
    const currentState = getWorktreeState("wt3");
    expect(currentState.state).toBe("dirty_owned");

    if (!currentState || currentState.state !== "executing") {
      const result = transitionWorktree("wt3", "executing", { assignedIssue: "ANQ-P4-4" });
      expect(result.ok).toBe(true);
    }

    const finalState = getWorktreeState("wt3");
    expect(finalState.state).toBe("executing");
  });
});

// ---------------------------------------------------------------------------
// 3. reconcileWorktreeCounters
// ---------------------------------------------------------------------------

describe("reconcileWorktreeCounters (Phase 4)", () => {
  beforeEach(async () => {
    const { setGlobalActiveRequests } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/global-active-requests.mjs");

    setGlobalActiveRequests(0);
    rawStateOnDisk = emptyStore();
    // Reset counters
    for (const wt of mockWorktrees) {
      wt.activeRequests = 0;
    }
  });

  it("should set counter to 1 when durable state is executing but counter is 0", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    // Set wt1 as executing in durable state
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-100" };
    rawStateOnDisk = store;

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(2);
    expect(mockWorktrees[0].activeRequests).toBe(1);
  });

  it("should set counter to 0 when durable state is not executing but counter > 0", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    // wt2 has stale counter but durable state is available
    mockWorktrees[1].activeRequests = 1;
    const store = emptyStore();
    store.worktreeStates["wt2"] = { state: "available" };
    rawStateOnDisk = store;

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(1);
    expect(mockWorktrees[1].activeRequests).toBe(0);
  });

  it("should not modify counters when already in sync", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");
    const { setGlobalActiveRequests } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/global-active-requests.mjs");

    // wt1 executing with counter=1, wt2 available with counter=0
    mockWorktrees[0].activeRequests = 1;
    setGlobalActiveRequests(1);
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-200" };
    store.worktreeStates["wt2"] = { state: "available" };
    rawStateOnDisk = store;

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(0);
  });

  it("should not modify Discord worktree counters (wt5+)", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    // wt5 has activeRequests=2 but no durable state — should not be corrected
    mockWorktrees[4].activeRequests = 2;
    rawStateOnDisk = emptyStore();

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(1);
    expect(mockWorktrees[4].activeRequests).toBe(2); // unchanged
  });

  it("should handle missing durable state as not-executing", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    // wt3 has counter=1 but no durable state at all
    mockWorktrees[2].activeRequests = 1;
    rawStateOnDisk = emptyStore();

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(1);
    expect(mockWorktrees[2].activeRequests).toBe(0);
  });

  it("should reset stale global active count from worktree counters", async () => {
    const globalCounters =
      await import("../../harness/ops/integrations/model/symphony-agent-router/global-active-requests.mjs");
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    globalCounters.setGlobalActiveRequests(7);
    rawStateOnDisk = emptyStore();

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(1);
    expect(globalCounters.globalActiveRequests).toBe(0);
  });

  it("should keep global active count equal to summed active worktrees", async () => {
    const globalCounters =
      await import("../../harness/ops/integrations/model/symphony-agent-router/global-active-requests.mjs");
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    globalCounters.setGlobalActiveRequests(0);
    mockWorktrees[4].activeRequests = 2;
    rawStateOnDisk = emptyStore();

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(1);
    expect(globalCounters.globalActiveRequests).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 4. getHealthyLinearCapacity uses assignedIssue
// ---------------------------------------------------------------------------

describe("getHealthyLinearCapacity assignedIssue field (Phase 4)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should return assignedIssue instead of issueIdentifier", async () => {
    const { getHealthyLinearCapacity } =
      await import("../../harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity/get-healthy-linear-capacity.mjs");

    const store = emptyStore();
    store.worktreeStates["wt1"] = {
      state: "executing",
      assignedIssue: "ANQ-P4-CAP",
    };
    rawStateOnDisk = store;

    const capacity = getHealthyLinearCapacity();
    const wt1 = capacity.worktrees.find((w: Record<string, unknown>) => w.id === 1);
    expect(wt1).toBeDefined();
    expect(wt1!.assignedIssue).toBe("ANQ-P4-CAP");
    // Verify old field name is not present
    expect((wt1 as Record<string, unknown>).issueIdentifier).toBeUndefined();
  });

  it("should fall back to issueIdentifier for backwards compatibility", async () => {
    const { getHealthyLinearCapacity } =
      await import("../../harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity/get-healthy-linear-capacity.mjs");

    const store = emptyStore();
    store.worktreeStates["wt2"] = {
      state: "executing",
      issueIdentifier: "ANQ-P4-OLD",
    };
    rawStateOnDisk = store;

    const capacity = getHealthyLinearCapacity();
    const wt2 = capacity.worktrees.find((w: Record<string, unknown>) => w.id === 2);
    expect(wt2).toBeDefined();
    expect(wt2!.assignedIssue).toBe("ANQ-P4-OLD");
  });

  it("should report correct available count excluding executing worktrees", async () => {
    const { getHealthyLinearCapacity } =
      await import("../../harness/ops/orchestration/linear-reconciler/get-healthy-linear-capacity/get-healthy-linear-capacity.mjs");

    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-A" };
    store.worktreeStates["wt2"] = { state: "executing", assignedIssue: "ANQ-B" };
    // wt3, wt4 are available (no durable state)
    rawStateOnDisk = store;

    const capacity = getHealthyLinearCapacity();
    expect(capacity.total).toBe(4);
    expect(capacity.executing).toBe(2);
    expect(capacity.available).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 5. Full lifecycle: claim → worktree executing → release → available
// ---------------------------------------------------------------------------

describe("Full durable ownership lifecycle (Phase 4)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should complete: claim → wt executing → execute → wt available", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Step 1: Scheduler claims issue and sets worktree to executing
    const claim = claimIssue("ANQ-LIFECYCLE", { worktreeId: "wt1", source: "scheduler" });
    expect(claim.ok).toBe(true);

    const wtExec = transitionWorktree("wt1", "executing", { assignedIssue: "ANQ-LIFECYCLE" });
    expect(wtExec.ok).toBe(true);

    // Step 2: Runner acquires lease (claimed → executing)
    const lease = acquireLease("ANQ-LIFECYCLE", { runId: "run-1" });
    expect(lease.ok).toBe(true);

    // Step 3: Runner checks worktree state — already executing, skip transition
    const currentWt = getWorktreeState("wt1");
    expect(currentWt.state).toBe("executing");

    // Step 4: Execution completes, runner transitions to integration_pending
    const finish = transitionIssue("ANQ-LIFECYCLE", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
      lease: null,
      reason: "push_success",
    });
    expect(finish.ok).toBe(true);

    // Step 5: Runner releases worktree
    const wtAvail = transitionWorktree("wt1", "available", { assignedIssue: null });
    expect(wtAvail.ok).toBe(true);

    // Verify final state
    const finalWt = getWorktreeState("wt1");
    expect(finalWt.state).toBe("available");
    expect(finalWt.assignedIssue).toBeNull();
  });

  it("should show worktree as executing across scheduler cycles", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Cycle 1: Claim issue A for wt1
    claimIssue("ANQ-CYCLE-A", { worktreeId: "wt1", source: "scheduler" });
    transitionWorktree("wt1", "executing", { assignedIssue: "ANQ-CYCLE-A" });

    // Cycle 2: wt1 should be visible as executing
    const wt1State = getWorktreeState("wt1");
    expect(wt1State.state).toBe("executing");
    expect(wt1State.assignedIssue).toBe("ANQ-CYCLE-A");

    // Claim issue B for wt2 (wt1 would be filtered out by capacity check)
    claimIssue("ANQ-CYCLE-B", { worktreeId: "wt2", source: "scheduler" });
    transitionWorktree("wt2", "executing", { assignedIssue: "ANQ-CYCLE-B" });

    // Both worktrees executing
    expect(getWorktreeState("wt1").state).toBe("executing");
    expect(getWorktreeState("wt2").state).toBe("executing");
  });
});
