import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Workstream B Phase 3 — Migration tests.
 *
 * Tests that all migrated helpers correctly delegate to transitionIssue /
 * transitionWorktree instead of direct state manipulation. Covers:
 *
 * 1. claimIssue → transitionIssue("claimed")
 * 2. acquireLease → transitionIssue("executing")
 * 3. releaseLease → transitionIssue(inferred) + stale cleanup
 * 4. recordQuarantine → transitionWorktree("quarantined")
 * 5. clearQuarantine → transitionWorktree("available")
 * 6. transitionIssue finalization deep-merge
 * 7. integrated_main → completed phase mapping
 *
 * Mocking strategy: identical to Phase 2 — mock only I/O (save/load/lock/
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

function expiredLease() {
  return {
    owner: "scheduler",
    nonce: "scheduler-test-expired",
    run_id: "run-old",
    acquired_at: new Date(Date.now() - 3_600_000).toISOString(),
    heartbeat_at: new Date(Date.now() - 3_600_000).toISOString(),
    expires_at: new Date(Date.now() - 1_800_000).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 1. claimIssue
// ---------------------------------------------------------------------------

describe("claimIssue (Phase 3 migration)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should reject when worktreeId is missing", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    // @ts-expect-error — intentionally omitting worktreeId to test validation
    const result = claimIssue("ANQ-100", {});
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("missing_worktree_assignment");
  });

  it("should claim an eligible issue successfully", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const result = claimIssue("ANQ-100", { worktreeId: "wt1", source: "scheduler" });
    expect(result.ok).toBe(true);
    expect(result.lease).toBeDefined();
    expect(result.assignment).toBeDefined();
    expect(result.assignment.worktreeId).toBe("wt1");
    expect(result.assignment.source).toBe("scheduler");
  });

  it("should reject claiming an already-claimed issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    // First claim succeeds
    const first = claimIssue("ANQ-200", { worktreeId: "wt1" });
    expect(first.ok).toBe(true);

    // Second claim fails — issue is now in "claimed" phase
    const second = claimIssue("ANQ-200", { worktreeId: "wt2" });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("already_claimed");
  });

  it("should reject claiming a blocked issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const store = emptyStore();
    store.issues["ANQ-300"] = {
      issueIdentifier: "ANQ-300",
      human_only: true,
    };
    rawStateOnDisk = store;

    const result = claimIssue("ANQ-300", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("blocked");
  });

  it("should reject claiming an issue on cooldown", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const store = emptyStore();
    store.issues["ANQ-350"] = {
      issueIdentifier: "ANQ-350",
      cooldown_until: new Date(Date.now() + 60_000).toISOString(),
    };
    rawStateOnDisk = store;

    const result = claimIssue("ANQ-350", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("cooldown_active");
  });

  it("should record transition history on successful claim", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    claimIssue("ANQ-400", { worktreeId: "wt1" });

    const store = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const record = store.issues["ANQ-400"];
    const transitions = record.transitions as Array<Record<string, unknown>>;
    expect(transitions.length).toBeGreaterThanOrEqual(1);
    const last = transitions[transitions.length - 1];
    expect(last.from).toBe("eligible");
    expect(last.to).toBe("claimed");
    expect(last.reason).toBe("scheduler_claim");
  });
});

// ---------------------------------------------------------------------------
// 2. acquireLease
// ---------------------------------------------------------------------------

describe("acquireLease (Phase 3 migration)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should acquire a lease on a claimed issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");

    claimIssue("ANQ-500", { worktreeId: "wt1" });
    const result = acquireLease("ANQ-500", { runId: "run-abc" });
    expect(result.ok).toBe(true);
    expect(result.lease).toBeDefined();
    expect(result.lease.run_id).toBe("run-abc");
  });

  it("should reject acquiring lease on eligible issue (not claimed)", async () => {
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");

    // Issue is eligible, not claimed — eligible → executing is not valid
    const result = acquireLease("ANQ-550", { runId: "run-xyz" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("invalid_transition");
  });

  it("should reject acquiring lease when already executing", async () => {
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const store = emptyStore();
    store.issues["ANQ-600"] = {
      issueIdentifier: "ANQ-600",
      lease: activeLease("run-existing"),
    };
    rawStateOnDisk = store;

    // executing → executing is a self-transition — invalid
    const result = acquireLease("ANQ-600", { runId: "run-new" });
    expect(result.ok).toBe(false);
  });

  it("should record transition history on successful acquire", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");

    claimIssue("ANQ-650", { worktreeId: "wt1" });
    acquireLease("ANQ-650", { runId: "run-123" });

    const store = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const record = store.issues["ANQ-650"];
    const transitions = record.transitions as Array<Record<string, unknown>>;
    expect(transitions.length).toBe(2);
    expect(transitions[0].to).toBe("claimed");
    expect(transitions[1].from).toBe("claimed");
    expect(transitions[1].to).toBe("executing");
    expect(transitions[1].reason).toBe("lease_acquired");
  });
});

// ---------------------------------------------------------------------------
// 3. releaseLease
// ---------------------------------------------------------------------------

describe("releaseLease (Phase 3 migration)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should return ok with released=false when no lease exists", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const result = releaseLease("ANQ-700");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(false);
  });

  it("should release an active lease and transition to eligible", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");

    claimIssue("ANQ-750", { worktreeId: "wt1" });
    const result = releaseLease("ANQ-750");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(true);

    // Verify the issue is back to eligible (no lease)
    const store = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const record = store.issues["ANQ-750"];
    expect(record.lease).toBeNull();
  });

  it("should reject release when nonce does not match", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");

    claimIssue("ANQ-800", { worktreeId: "wt1" });
    const result = releaseLease("ANQ-800", "wrong-nonce");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("lease_mismatch");
  });

  it("should clean up stale (expired) lease via direct cleanup", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const store = emptyStore();
    store.issues["ANQ-850"] = {
      issueIdentifier: "ANQ-850",
      lease: expiredLease(),
    };
    rawStateOnDisk = store;

    const result = releaseLease("ANQ-850");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(true);

    // Verify lease is removed
    const updated = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    expect(updated.issues["ANQ-850"].lease).toBeNull();
  });

  it("should release lease and return to integration_pending when finalization exists", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const store = emptyStore();
    store.issues["ANQ-900"] = {
      issueIdentifier: "ANQ-900",
      lease: activeLease("run-abc"),
      finalization: { state: "integration_pending", branch: "symphony/wt1" },
    };
    rawStateOnDisk = store;

    const result = releaseLease("ANQ-900");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(true);

    // After release, the hypothetical phase without lease should be integration_pending
    const updated = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const record = updated.issues["ANQ-900"];
    expect(record.lease).toBeNull();
    expect((record.finalization as Record<string, unknown>).state).toBe("integration_pending");
  });
});

// ---------------------------------------------------------------------------
// 4. recordQuarantine
// ---------------------------------------------------------------------------

describe("recordQuarantine (Phase 3 migration)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should quarantine an executing worktree", async () => {
    const { transitionWorktree } =
      await import("../../harness/ops/core/symphony-state/transition-worktree.mjs");
    const { recordQuarantine } =
      await import("../../harness/ops/core/symphony-state/record-quarantine.mjs");

    // First set up the worktree as executing
    transitionWorktree("wt1", "executing", { assignedIssue: "ANQ-100" });

    const result = recordQuarantine("wt1", {
      reason: "bridge_unhealthy",
      lastError: "timeout",
    });
    expect(result.ok).toBe(true);
    expect(result.to).toBe("quarantined");

    const store = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const wt = store.worktreeStates["wt1"];
    expect(wt.state).toBe("quarantined");
    expect(wt.reason).toBe("bridge_unhealthy");
    expect(wt.lastError).toBe("timeout");
  });

  it("should quarantine an available worktree", async () => {
    const { recordQuarantine } =
      await import("../../harness/ops/core/symphony-state/record-quarantine.mjs");

    // available → quarantined is valid
    const result = recordQuarantine("wt2", { reason: "diverged" });
    expect(result.ok).toBe(true);
    expect(result.from).toBe("available");
    expect(result.to).toBe("quarantined");
  });
});

// ---------------------------------------------------------------------------
// 5. clearQuarantine
// ---------------------------------------------------------------------------

describe("clearQuarantine (Phase 3 migration)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should clear quarantine and return to available", async () => {
    const { clearQuarantine } =
      await import("../../harness/ops/core/symphony-state/clear-quarantine.mjs");

    // Set up quarantined worktree
    const store = emptyStore();
    store.worktreeStates["wt3"] = {
      state: "quarantined",
      reason: "diverged",
      quarantinedAt: "2026-04-14T00:00:00Z",
      lastError: "branch diverged",
    };
    rawStateOnDisk = store;

    const result = clearQuarantine("wt3");
    expect(result.ok).toBe(true);
    expect(result.from).toBe("quarantined");
    expect(result.to).toBe("available");

    const updated = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const wt = updated.worktreeStates["wt3"];
    expect(wt.state).toBe("available");
    expect(wt.assignedIssue).toBeNull();
    expect(wt.reason).toBeNull();
    expect(wt.repairAttempts).toBe(0);
  });

  it("should clear stale quarantine metadata on an available worktree", async () => {
    const { clearQuarantine } =
      await import("../../harness/ops/core/symphony-state/clear-quarantine.mjs");

    const store = emptyStore();
    store.worktreeStates["wt4"] = {
      state: "available",
      reason: "dirty_owned",
      quarantinedAt: "2026-04-14T00:00:00Z",
      lastError: "stale",
    };
    rawStateOnDisk = store;

    const result = clearQuarantine("wt4");
    expect(result.ok).toBe(true);
    expect(result.from).toBe("available");
    expect(result.to).toBe("available");

    const updated = rawStateOnDisk as Record<string, Record<string, Record<string, unknown>>>;
    const wt = updated.worktreeStates["wt4"];
    expect(wt.reason).toBeNull();
    expect(wt.quarantinedAt).toBeNull();
    expect(wt.lastError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 6. transitionIssue finalization deep-merge
// ---------------------------------------------------------------------------

describe("transitionIssue finalization deep-merge", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should deep-merge finalization with existing finalization fields", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");

    // Set up issue in executing phase with existing finalization
    const store = emptyStore();
    store.issues["ANQ-DM-1"] = {
      issueIdentifier: "ANQ-DM-1",
      lease: activeLease("run-abc"),
      finalization: {
        worktreeId: "wt1",
        branch: "symphony/wt1",
        stickyOwner: "wt1",
      },
    };
    rawStateOnDisk = store;

    // Transition to validation_failed with partial finalization update
    const result = transitionIssue("ANQ-DM-1", "validation_failed", {
      finalization: {
        state: "validation_failed_repairable",
        lastError: "lint error",
        attempts: 1,
      },
      reason: "validation_failed",
    });

    expect(result.ok).toBe(true);
    const fin = (result.record as Record<string, unknown>).finalization as Record<string, unknown>;
    // Existing fields preserved via deep-merge
    expect(fin.worktreeId).toBe("wt1");
    expect(fin.branch).toBe("symphony/wt1");
    expect(fin.stickyOwner).toBe("wt1");
    // New fields applied
    expect(fin.state).toBe("validation_failed_repairable");
    expect(fin.lastError).toBe("lint error");
    expect(fin.attempts).toBe(1);
  });

  it("should work correctly when no prior finalization exists", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");

    // Set up issue in executing phase without finalization
    const store = emptyStore();
    store.issues["ANQ-DM-2"] = {
      issueIdentifier: "ANQ-DM-2",
      lease: activeLease("run-xyz"),
    };
    rawStateOnDisk = store;

    const result = transitionIssue("ANQ-DM-2", "commit_failed", {
      finalization: {
        state: "commit_failed_repairable",
        lastError: "git commit failed",
      },
    });

    expect(result.ok).toBe(true);
    const fin = (result.record as Record<string, unknown>).finalization as Record<string, unknown>;
    expect(fin.state).toBe("commit_failed_repairable");
    expect(fin.lastError).toBe("git commit failed");
  });
});

// ---------------------------------------------------------------------------
// 7. integrated_main → completed phase mapping
// ---------------------------------------------------------------------------

describe("integrated_main phase mapping", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should infer completed phase from integrated_main finalization state", async () => {
    const { inferExecutionPhase } =
      await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");
    const record = normalizeRecord({
      issueIdentifier: "ANQ-PM-1",
      finalization: { state: "integrated_main" },
    });
    expect(inferExecutionPhase(record)).toBe("completed");
  });

  it("should allow evidence_pending → completed transition for integrated_main", async () => {
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");

    const store = emptyStore();
    store.issues["ANQ-PM-2"] = {
      issueIdentifier: "ANQ-PM-2",
      finalization: { state: "evidence_pending_closeout" },
    };
    rawStateOnDisk = store;

    const result = transitionIssue("ANQ-PM-2", "completed", {
      finalization: {
        state: "integrated_main",
        integratedMainSha: "abc123",
      },
      reason: "evidence_published",
    });

    expect(result.ok).toBe(true);
    expect(result.from).toBe("evidence_pending");
    expect(result.to).toBe("completed");
  });
});

// ---------------------------------------------------------------------------
// 8. Full lifecycle integration: claim → acquire → execute → finalize
// ---------------------------------------------------------------------------

describe("Full issue lifecycle via migrated helpers", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should complete a full lifecycle: eligible → claimed → executing → integration_pending → evidence_pending → completed", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { transitionIssue } =
      await import("../../harness/ops/core/symphony-state/transition-issue.mjs");

    // Step 1: Claim
    const claim = claimIssue("ANQ-LIFE", { worktreeId: "wt1", source: "linear" });
    expect(claim.ok).toBe(true);

    // Step 2: Acquire lease (claimed → executing)
    const acquire = acquireLease("ANQ-LIFE", { runId: "run-1" });
    expect(acquire.ok).toBe(true);

    // Step 3: Push success (executing → integration_pending)
    const push = transitionIssue("ANQ-LIFE", "integration_pending", {
      finalization: {
        state: "integration_pending",
        branch: "symphony/wt1",
        headSha: "abc123",
      },
      lease: null,
      reason: "branch_push_success",
    });
    expect(push.ok).toBe(true);
    expect(push.from).toBe("executing");

    // Step 4: Integration success (integration_pending → evidence_pending)
    const evidence = transitionIssue("ANQ-LIFE", "evidence_pending", {
      finalization: {
        state: "evidence_pending_closeout",
        integratedMainSha: "def456",
      },
      reason: "integration_success",
    });
    expect(evidence.ok).toBe(true);
    expect(evidence.from).toBe("integration_pending");

    // Step 5: Close out (evidence_pending → completed)
    const complete = transitionIssue("ANQ-LIFE", "completed", {
      finalization: {
        state: "integrated_main",
      },
      completed_at: new Date().toISOString(),
      reason: "evidence_published",
    });
    expect(complete.ok).toBe(true);
    expect(complete.from).toBe("evidence_pending");
    expect(complete.to).toBe("completed");

    // Verify full transition history
    const record = complete.record as Record<string, unknown>;
    const transitions = record.transitions as Array<Record<string, unknown>>;
    expect(transitions.length).toBe(5);
    expect(transitions.map((t) => t.to)).toEqual([
      "claimed",
      "executing",
      "integration_pending",
      "evidence_pending",
      "completed",
    ]);
  });
});
