import { describe, it, expect, beforeEach, vi } from "vitest";

import { setGlobalActiveRequests } from "../../harness/ops/integrations/model/symphony-agent-router/global-active-requests.mjs";

/**
 * Workstream B Phase 6 — No-transient-correctness proof.
 *
 * Proves that router startup with zeroed transient counters still makes
 * correct execution ownership decisions because durable state is the
 * authority. This is the core Phase 6 safety property:
 *
 * "Router and scheduler no longer rely on transient memory for
 *  correctness; all execution ownership is reconstructable from
 *  durable state after restart."
 *
 * Tests:
 * 1. Restart reconstruction: zeroed counters → reconciliation → correct
 * 2. Durable-state availability: executing worktrees filtered regardless of counters
 * 3. Mixed state reconstruction: multiple worktrees in various durable states
 * 4. Stale counter correction: counter disagrees with durable → durable wins
 * 5. Counter-independent dispatch safety: correct before reconciliation runs
 * 6. Full 4-worktree restart scenario
 *
 * Mocking strategy: mock I/O (save/load/lock/host/time) for symphony-state;
 * mock WORKTREES and logger for the router layer; let all pure logic run.
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
// Router-level mocks
// ---------------------------------------------------------------------------

const { mockWorktrees } = vi.hoisted(() => ({
  mockWorktrees: [
    { id: 1, path: "/wt1", port: 4321, activeRequests: 0, failures: 0 },
    { id: 2, path: "/wt2", port: 4322, activeRequests: 0, failures: 0 },
    { id: 3, path: "/wt3", port: 4323, activeRequests: 0, failures: 0 },
    { id: 4, path: "/wt4", port: 4324, activeRequests: 0, failures: 0 },
  ],
}));

vi.mock("../../harness/ops/integrations/model/symphony-agent-router/worktrees.mjs", () => ({
  WORKTREES: mockWorktrees,
}));

vi.mock("../../harness/ops/integrations/model/symphony-agent-router/logger.mjs", () => ({
  logInfo: () => {},
  logWarn: () => {},
  logError: () => {},
  logDebug: () => {},
}));

// Redirect the barrel to the real core modules (same as Phase 4 tests)
vi.mock("../../harness/ops/symphony-state.mjs", async () => {
  const actual = (await vi.importActual(
    "../../harness/ops/core/symphony-state/index.mjs",
  )) as Record<string, unknown>;
  return actual;
});

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

function zeroAllCounters() {
  for (const wt of mockWorktrees) {
    wt.activeRequests = 0;
    wt.failures = 0;
  }
  setGlobalActiveRequests(0);
}

// ---------------------------------------------------------------------------
// 1. Restart reconstruction: zeroed counters → reconciliation → correct
// ---------------------------------------------------------------------------

describe("Restart reconstruction (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
    zeroAllCounters();
  });

  it("should reconstruct all counters from durable state after restart", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    // Durable state: wt1 executing, wt2 executing, wt3/wt4 available
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-R1" };
    store.worktreeStates["wt2"] = { state: "executing", assignedIssue: "ANQ-R2" };
    store.worktreeStates["wt3"] = { state: "available" };
    store.worktreeStates["wt4"] = { state: "available" };
    rawStateOnDisk = store;

    // All counters start at zero (simulating restart)
    expect(mockWorktrees.every((wt) => wt.activeRequests === 0)).toBe(true);

    // Reconciliation reconstructs counters
    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(3);

    // Counters now reflect durable state
    expect(mockWorktrees[0].activeRequests).toBe(1); // wt1 executing
    expect(mockWorktrees[1].activeRequests).toBe(1); // wt2 executing
    expect(mockWorktrees[2].activeRequests).toBe(0); // wt3 available
    expect(mockWorktrees[3].activeRequests).toBe(0); // wt4 available
  });

  it("should handle all worktrees executing after restart", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    const store = emptyStore();
    for (let i = 1; i <= 4; i++) {
      store.worktreeStates[`wt${i}`] = { state: "executing", assignedIssue: `ANQ-FULL-${i}` };
    }
    rawStateOnDisk = store;

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(5);
    expect(mockWorktrees.every((wt) => wt.activeRequests === 1)).toBe(true);
  });

  it("should handle all worktrees available after restart (no corrections)", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");

    rawStateOnDisk = emptyStore(); // No durable worktree state

    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(0);
    expect(mockWorktrees.every((wt) => wt.activeRequests === 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Durable-state availability: filter uses durable state, not counters
// ---------------------------------------------------------------------------

describe("Durable-state availability filter (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
    zeroAllCounters();
  });

  it("should identify executing worktrees from durable state even with zeroed counters", async () => {
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Durable state: wt1 executing, wt2 available
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-AVAIL-1" };
    store.worktreeStates["wt2"] = { state: "available" };
    rawStateOnDisk = store;

    // Counters are ALL zero (post-restart, pre-reconciliation)
    expect(mockWorktrees[0].activeRequests).toBe(0);
    expect(mockWorktrees[1].activeRequests).toBe(0);

    // The durable-state availability filter (same pattern as runtime.mjs)
    const linearWorktrees = mockWorktrees.filter((w) => w.id >= 1 && w.id <= 4);
    const available = linearWorktrees.filter((w) => {
      const state = getWorktreeState(`wt${w.id}`);
      return !state || state.state !== "executing";
    });

    // wt1 is correctly identified as busy despite counter=0
    expect(available.map((w) => w.id)).not.toContain(1);
    // wt2, wt3, wt4 are available
    expect(available.map((w) => w.id)).toContain(2);
    expect(available.map((w) => w.id)).toContain(3);
    expect(available.map((w) => w.id)).toContain(4);
  });

  it("should show zero available slots when all worktrees executing (durable state)", async () => {
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    const store = emptyStore();
    for (let i = 1; i <= 4; i++) {
      store.worktreeStates[`wt${i}`] = { state: "executing", assignedIssue: `ANQ-BUSY-${i}` };
    }
    rawStateOnDisk = store;

    // All counters zero — a counter-based check would see 4 slots available
    const linearWorktrees = mockWorktrees.filter((w) => w.id >= 1 && w.id <= 4);
    const available = linearWorktrees.filter((w) => {
      const state = getWorktreeState(`wt${w.id}`);
      return !state || state.state !== "executing";
    });

    // Durable state correctly shows NO available slots
    expect(available).toHaveLength(0);
  });

  it("should not be fooled by stale counter=1 when durable state is available", async () => {
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Durable state: wt1 is available
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "available" };
    rawStateOnDisk = store;

    // Stale counter says busy
    mockWorktrees[0].activeRequests = 1;

    // Durable-state filter sees available
    const state = getWorktreeState("wt1");
    expect(!state || state.state !== "executing").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Counter-independent dispatch safety
// ---------------------------------------------------------------------------

describe("Counter-independent dispatch safety (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
    zeroAllCounters();
  });

  it("should correctly determine ownership from durable state without counters", async () => {
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Durable state: wt1 owned by ANQ-OWN, wt2 free
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-OWN" };
    store.worktreeStates["wt2"] = { state: "available" };
    rawStateOnDisk = store;

    // Even without counter reconstruction, durable ownership is readable
    expect(getWorktreeOwner("wt1")).toBe("ANQ-OWN");
    expect(getWorktreeOwner("wt2")).toBeNull();

    // And durable state is readable
    expect(getWorktreeState("wt1")?.state).toBe("executing");
    expect(getWorktreeState("wt2")?.state).toBe("available");
  });

  it("should allow new claims only on durably-available worktrees", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");

    // wt1 is executing, wt2 is available in durable state
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-EXIST" };
    store.worktreeStates["wt2"] = { state: "available" };
    rawStateOnDisk = store;

    // Attempt to claim wt1 — should fail (durable state is executing)
    const fail = claimAndAssignWorktree("ANQ-NEW-1", { worktreeId: "wt1" });
    expect(fail.ok).toBe(false);
    expect(fail.reason).toBe("worktree_unavailable");

    // Attempt to claim wt2 — should succeed (durable state is available)
    const ok = claimAndAssignWorktree("ANQ-NEW-2", { worktreeId: "wt2" });
    expect(ok.ok).toBe(true);
  });

  it("should reconstruct correct available count for queue drain", async () => {
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // 3 of 4 worktrees executing after restart
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-Q1" };
    store.worktreeStates["wt2"] = { state: "executing", assignedIssue: "ANQ-Q2" };
    store.worktreeStates["wt3"] = { state: "executing", assignedIssue: "ANQ-Q3" };
    // wt4 has no durable state (never used)
    rawStateOnDisk = store;

    // Queue drain availability calculation (same as runtime.mjs)
    const linearWorktrees = mockWorktrees.filter((w) => w.id >= 1 && w.id <= 4);
    const available = linearWorktrees.filter((w) => {
      const state = getWorktreeState(`wt${w.id}`);
      return !state || state.state !== "executing";
    });

    // Exactly 1 slot available for queue processing
    expect(available).toHaveLength(1);
    expect(available[0].id).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// 4. Full 4-worktree restart scenario
// ---------------------------------------------------------------------------

describe("Full restart scenario (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
    zeroAllCounters();
  });

  it("should reconstruct complete view from mixed durable state", async () => {
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");

    // Durable state: mixed worktree states
    const store = emptyStore();
    store.worktreeStates["wt1"] = { state: "executing", assignedIssue: "ANQ-MIX-1" };
    store.worktreeStates["wt2"] = { state: "quarantined", reason: "flaky" };
    store.worktreeStates["wt3"] = { state: "available" };
    // wt4: no durable state at all
    rawStateOnDisk = store;

    // Step 1: Before reconciliation — counters are all zero
    expect(mockWorktrees.every((wt) => wt.activeRequests === 0)).toBe(true);

    // Step 2: Durable state is already readable (no reconciliation needed)
    expect(getWorktreeState("wt1")?.state).toBe("executing");
    expect(getWorktreeOwner("wt1")).toBe("ANQ-MIX-1");
    expect(getWorktreeState("wt2")?.state).toBe("quarantined");
    expect(getWorktreeState("wt3")?.state).toBe("available");
    expect(getWorktreeState("wt4")).toBeNull();

    // Step 3: Availability filter is correct even before reconciliation
    const linearWorktrees = mockWorktrees.filter((w) => w.id >= 1 && w.id <= 4);
    const available = linearWorktrees.filter((w) => {
      const state = getWorktreeState(`wt${w.id}`);
      return !state || state.state !== "executing";
    });
    // wt1=executing (filtered out), wt2=quarantined (available? yes per filter — it's not 'executing')
    // wt3=available, wt4=null (available)
    expect(available.map((w) => w.id).sort()).toEqual([2, 3, 4]);

    // Step 4: Reconciliation corrects counters
    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(2); // wt1 activeRequests + global active count
    expect(mockWorktrees[0].activeRequests).toBe(1);
    expect(mockWorktrees[1].activeRequests).toBe(0); // quarantined ≠ executing
    expect(mockWorktrees[2].activeRequests).toBe(0);
    expect(mockWorktrees[3].activeRequests).toBe(0);
  });

  it("should maintain correct view through claim-then-restart cycle", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { reconcileWorktreeCounters } =
      await import("../../harness/ops/integrations/model/symphony-agent-router/reconcile-worktree-counters.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Phase A: claim issues on wt1 and wt2
    claimAndAssignWorktree("ANQ-CYC-1", { worktreeId: "wt1" });
    claimAndAssignWorktree("ANQ-CYC-2", { worktreeId: "wt2" });

    // Verify durable state was set by claims
    expect(getWorktreeState("wt1")?.state).toBe("executing");
    expect(getWorktreeState("wt2")?.state).toBe("executing");

    // Phase B: simulate restart (zero all counters)
    zeroAllCounters();
    expect(mockWorktrees[0].activeRequests).toBe(0);
    expect(mockWorktrees[1].activeRequests).toBe(0);

    // Phase C: reconciliation restores counters from durable state
    const corrections = reconcileWorktreeCounters();
    expect(corrections).toBe(3);
    expect(mockWorktrees[0].activeRequests).toBe(1);
    expect(mockWorktrees[1].activeRequests).toBe(1);
    expect(mockWorktrees[2].activeRequests).toBe(0);
    expect(mockWorktrees[3].activeRequests).toBe(0);
  });
});
