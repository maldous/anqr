import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Workstream B Phase 2 — Transition helpers tests.
 *
 * Tests all Phase 2 modules:
 * 1. transitionIssue() — validates phase transitions, applies metadata, records history
 * 2. transitionWorktree() — validates state transitions, normalizes via schema
 * 3. getWorktreeOwner() — durable ownership lookup
 * 4. Deprecation warnings on old mutation helpers
 *
 * Mocking strategy: mock only I/O (save/load/lock/host/time);
 * let normalizeRecord, inferExecutionPhase, transition maps, and
 * worktree schema run for real.
 */

// ---------------------------------------------------------------------------
// Shared in-memory state store (simulates disk)
// ---------------------------------------------------------------------------

let rawStateOnDisk: Record<string, unknown> = {};

// Import normalizeRecord eagerly for the loadState mock
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

function activeLease(runId: string | null = null) {
  return {
    owner: "scheduler",
    nonce: "scheduler-test-1",
    run_id: runId,
    acquired_at: new Date().toISOString(),
    heartbeat_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 600_000).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 1. transitionIssue
// ---------------------------------------------------------------------------

describe("transitionIssue", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should reject invalid target phase", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const result = transitionIssue("ANQ-100", "nonexistent_phase");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_target_phase");
    expect(result.from).toBeNull();
    expect(result.to).toBe("nonexistent_phase");
  });

  it("should reject invalid transition (eligible → completed)", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const result = transitionIssue("ANQ-100", "completed");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_transition");
    expect(result.from).toBe("eligible");
    expect(result.to).toBe("completed");
  });

  it("should succeed for valid transition (eligible → claimed)", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const result = transitionIssue("ANQ-100", "claimed", {
      lease: activeLease(),
      assignment: { worktreeId: "wt1", source: "scheduler", claimedBy: "scheduler" },
    });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("eligible");
    expect(result.to).toBe("claimed");
    expect(result.record).toBeDefined();
  });

  it("should apply metadata as patch to the record", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const lease = activeLease();
    const result = transitionIssue("ANQ-200", "claimed", {
      lease,
      assignment: { worktreeId: "wt2", source: "scheduler", claimedBy: "scheduler" },
    });
    expect(result.ok).toBe(true);
    const record = result.record as Record<string, unknown>;
    expect(record.lease).not.toBeNull();
    expect(record.assignment).not.toBeNull();
    const assignment = record.assignment as Record<string, unknown>;
    expect(assignment.worktreeId).toBe("wt2");
  });

  it("should record transition in history with from/to/reason", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const result = transitionIssue("ANQ-300", "claimed", {
      lease: activeLease(),
      assignment: { worktreeId: "wt1" },
      reason: "scheduler_dispatch",
    });
    expect(result.ok).toBe(true);
    const record = result.record as Record<string, unknown>;
    const transitions = record.transitions as Array<Record<string, unknown>>;
    expect(transitions.length).toBeGreaterThanOrEqual(1);
    const last = transitions[transitions.length - 1];
    expect(last.from).toBe("eligible");
    expect(last.to).toBe("claimed");
    expect(last.reason).toBe("scheduler_dispatch");
    expect(last.host).toBe("test-host");
    expect(last.at).toBe("2026-04-15T12:00:00.000Z");
  });

  it("should default reason to null in history when not provided", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const result = transitionIssue("ANQ-350", "claimed", {
      lease: activeLease(),
      assignment: { worktreeId: "wt1" },
    });
    expect(result.ok).toBe(true);
    const transitions = (result.record as Record<string, unknown>).transitions as Array<
      Record<string, unknown>
    >;
    const last = transitions[transitions.length - 1];
    expect(last.reason).toBeNull();
  });

  it("should handle first-time issue (no existing state) starting as eligible", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    // Issue doesn't exist in store — should be inferred as eligible
    const result = transitionIssue("ANQ-NEW", "blocked", {
      human_only: true,
      reason: "needs_human_review",
    });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("eligible");
    expect(result.to).toBe("blocked");
    const record = result.record as Record<string, unknown>;
    expect(record.human_only).toBe(true);
  });

  it("should correctly infer phase from active lease as claimed", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    // Set up an issue with an active lease (no run_id → claimed)
    const store = emptyStore();
    store.issues["ANQ-400"] = {
      issueIdentifier: "ANQ-400",
      lease: activeLease(null),
    };
    rawStateOnDisk = store;

    // claimed → executing is valid
    const result = transitionIssue("ANQ-400", "executing", {
      lease: { ...activeLease("run-abc"), run_id: "run-abc" },
    });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("claimed");
    expect(result.to).toBe("executing");
  });

  it("should correctly infer phase from active lease with run_id as executing", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const store = emptyStore();
    store.issues["ANQ-450"] = {
      issueIdentifier: "ANQ-450",
      lease: activeLease("run-xyz"),
    };
    rawStateOnDisk = store;

    // executing → integration_pending is valid
    const result = transitionIssue("ANQ-450", "integration_pending", {
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
      lease: null, // release lease on finalization
    });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("executing");
    expect(result.to).toBe("integration_pending");
  });

  it("should preserve existing record fields through transition", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const store = emptyStore();
    store.issues["ANQ-500"] = {
      issueIdentifier: "ANQ-500",
      source: "linear",
      retry_count: 3,
    };
    rawStateOnDisk = store;

    const result = transitionIssue("ANQ-500", "blocked", {
      human_only: true,
    });
    expect(result.ok).toBe(true);
    const record = result.record as Record<string, unknown>;
    expect(record.source).toBe("linear");
    expect(record.retry_count).toBe(3);
    expect(record.human_only).toBe(true);
  });

  it("should reject transition when issue is in wrong phase", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");
    const store = emptyStore();
    store.issues["ANQ-600"] = {
      issueIdentifier: "ANQ-600",
      completed_at: "2026-04-15T00:00:00Z",
    };
    rawStateOnDisk = store;

    // completed → executing is invalid (must go through eligible first)
    const result = transitionIssue("ANQ-600", "executing");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_transition");
    expect(result.from).toBe("completed");
    expect(result.to).toBe("executing");
  });
});

// ---------------------------------------------------------------------------
// 2. transitionWorktree
// ---------------------------------------------------------------------------

describe("transitionWorktree", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should reject invalid target state", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const result = transitionWorktree("wt1", "nonexistent_state");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_target_state");
    expect(result.from).toBeNull();
  });

  it("should reject invalid transition (available → dirty_owned)", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const result = transitionWorktree("wt1", "dirty_owned");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_transition");
    expect(result.from).toBe("available");
    expect(result.to).toBe("dirty_owned");
  });

  it("should succeed for valid transition (available → executing)", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const result = transitionWorktree("wt1", "executing", {
      assignedIssue: "ANQ-100",
      owner: "scheduler",
    });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("available");
    expect(result.to).toBe("executing");
    expect(result.record).toBeDefined();
  });

  it("should normalize result via normalizeWorktreeRecord", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const result = transitionWorktree("wt2", "executing", {
      assignedIssue: "ANQ-200",
    });
    expect(result.ok).toBe(true);
    const record = result.record as Record<string, unknown>;
    // Verify canonical schema fields from normalizeWorktreeRecord
    expect(record.worktreeId).toBe("wt2");
    expect(record.state).toBe("executing");
    expect(record.assignedIssue).toBe("ANQ-200");
    expect(record.owner).toBeNull();
    expect(record.repairAttempts).toBe(0);
    expect(record.updatedAt).toBeDefined();
  });

  it("should default from-state to available for unknown worktree", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    // wt-new doesn't exist in store → defaults to available
    const result = transitionWorktree("wt-new", "executing");
    expect(result.ok).toBe(true);
    expect(result.from).toBe("available");
  });

  it("should preserve metadata fields through transition", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const result = transitionWorktree("wt3", "executing", {
      assignedIssue: "ANQ-300",
      owner: "scheduler",
      leasedAt: "2026-04-15T00:00:00Z",
    });
    expect(result.ok).toBe(true);
    const record = result.record as Record<string, unknown>;
    expect(record.assignedIssue).toBe("ANQ-300");
    expect(record.owner).toBe("scheduler");
    expect(record.leasedAt).toBe("2026-04-15T00:00:00Z");
  });

  it("should allow same-state metadata cleanup", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const store = emptyStore();
    store.worktreeStates["wt-cleanup"] = {
      state: "available",
      reason: "dirty_owned",
      quarantinedAt: "2026-04-14T00:00:00Z",
      lastError: "stale",
    };
    rawStateOnDisk = store;

    const result = transitionWorktree("wt-cleanup", "available", {
      reason: null,
      quarantinedAt: null,
      lastError: null,
    });

    expect(result.ok).toBe(true);
    expect(result.from).toBe("available");
    expect(result.to).toBe("available");
    const record = result.record as Record<string, unknown>;
    expect(record.reason).toBeNull();
    expect(record.quarantinedAt).toBeNull();
    expect(record.lastError).toBeNull();
  });

  it("should handle executing → dirty_owned transition", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const store = emptyStore();
    store.worktreeStates["wt4"] = {
      state: "executing",
      assignedIssue: "ANQ-400",
    };
    rawStateOnDisk = store;

    const result = transitionWorktree("wt4", "dirty_owned");
    expect(result.ok).toBe(true);
    expect(result.from).toBe("executing");
    expect(result.to).toBe("dirty_owned");
    const record = result.record as Record<string, unknown>;
    expect(record.assignedIssue).toBe("ANQ-400"); // preserved
  });

  it("should handle quarantined → available transition", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const store = emptyStore();
    store.worktreeStates["wt5"] = {
      state: "quarantined",
      reason: "diverged",
      quarantinedAt: "2026-04-14T00:00:00Z",
    };
    rawStateOnDisk = store;

    const result = transitionWorktree("wt5", "available", {
      assignedIssue: null,
      reason: null,
      quarantinedAt: null,
    });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("quarantined");
    expect(result.to).toBe("available");
  });
});

// ---------------------------------------------------------------------------
// 3. getWorktreeOwner
// ---------------------------------------------------------------------------

describe("getWorktreeOwner", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should return assignedIssue from worktree state", async () => {
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");
    const store = emptyStore();
    store.worktreeStates["wt1"] = { assignedIssue: "ANQ-100", state: "executing" };
    rawStateOnDisk = store;

    expect(getWorktreeOwner("wt1")).toBe("ANQ-100");
  });

  it("should return issueIdentifier (old field) for backwards compat", async () => {
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");
    const store = emptyStore();
    store.worktreeStates["wt2"] = { issueIdentifier: "ANQ-200", state: "dirty_owned" };
    rawStateOnDisk = store;

    expect(getWorktreeOwner("wt2")).toBe("ANQ-200");
  });

  it("should return null for unknown worktree", async () => {
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");
    expect(getWorktreeOwner("wt-nonexistent")).toBeNull();
  });

  it("should return null when no assignment exists", async () => {
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");
    const store = emptyStore();
    store.worktreeStates["wt3"] = { state: "available" };
    rawStateOnDisk = store;

    expect(getWorktreeOwner("wt3")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. Deprecation warnings
// ---------------------------------------------------------------------------

describe("Deprecation warnings on old mutation helpers", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("patchIssueState should NOT emit deprecation warning (metadata-only API)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { patchIssueState } =
      await import("../../harness/ops/core/symphony-state/patch-issue-state.mjs");

    patchIssueState("ANQ-DEP-1", { source: "test" });

    const deprecationCalls = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === "string" && args[0].includes("patchIssueState"),
    );
    expect(deprecationCalls).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it("patchIssueState should still function correctly", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { patchIssueState } =
      await import("../../harness/ops/core/symphony-state/patch-issue-state.mjs");

    const result = patchIssueState("ANQ-DEP-2", { source: "test", retry_count: 5 });
    expect(result.source).toBe("test");
    expect(result.retry_count).toBe(5);
    expect(result.issueIdentifier).toBe("ANQ-DEP-2");
    warnSpy.mockRestore();
  });

  it("setFinalizationState should emit deprecation warning", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { setFinalizationState } =
      await import("../../harness/ops/core/symphony-state/set-finalization-state.mjs");

    setFinalizationState("ANQ-DEP-3", { state: "integration_pending" });

    const deprecationCalls = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === "string" && args[0].includes("setFinalizationState"),
    );
    expect(deprecationCalls.length).toBeGreaterThanOrEqual(1);
    warnSpy.mockRestore();
  });

  it("setWorktreeState should emit deprecation warning", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { setWorktreeState } =
      await import("../../harness/ops/core/symphony-state/set-worktree-state.mjs");

    setWorktreeState("wt-dep", { state: "executing" });

    const deprecationCalls = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === "string" && args[0].includes("setWorktreeState"),
    );
    expect(deprecationCalls.length).toBeGreaterThanOrEqual(1);
    warnSpy.mockRestore();
  });
});
