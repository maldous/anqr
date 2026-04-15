import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Workstream B Phase 6 — Stale lease handling and orphaned assignment tests.
 *
 * Proves correct handling of edge cases in the lease lifecycle:
 *
 * 1. findExpiredLeases identifies issues with expired leases
 * 2. findExpiredLeases ignores active leases and lease-less issues
 * 3. releaseLease on expired lease: direct cleanup without transition validation
 * 4. releaseLease clears worktree ownership for expired leases (bidirectional)
 * 5. Orphaned assignment: worktree executing but issue released
 * 6. releaseLease nonce mismatch rejection
 * 7. releaseLease on non-existent lease
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

function makeExpiredLease() {
  return {
    owner: "scheduler",
    nonce: "expired-nonce-001",
    run_id: "run-expired",
    acquired_at: "2020-01-01T00:00:00.000Z",
    heartbeat_at: "2020-01-01T00:00:00.000Z",
    expires_at: "2020-01-01T01:00:00.000Z", // far in the past
  };
}

function makeActiveLease() {
  return {
    owner: "scheduler",
    nonce: "active-nonce-001",
    run_id: "run-active",
    acquired_at: "2026-04-15T00:00:00.000Z",
    heartbeat_at: "2026-04-15T00:00:00.000Z",
    expires_at: "2099-01-01T00:00:00.000Z", // far in the future
  };
}

// ---------------------------------------------------------------------------
// 1. findExpiredLeases
// ---------------------------------------------------------------------------

describe("findExpiredLeases (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should identify issues with expired leases", async () => {
    const { findExpiredLeases } =
      await import("../../harness/ops/core/symphony-state/find-expired-leases.mjs");

    const store = emptyStore();
    store.issues["ANQ-EXP-1"] = {
      issueIdentifier: "ANQ-EXP-1",
      lease: makeExpiredLease(),
    };
    rawStateOnDisk = store;

    const expired = findExpiredLeases();
    expect(expired).toHaveLength(1);
    expect(expired[0].issueIdentifier).toBe("ANQ-EXP-1");
  });

  it("should ignore issues with active leases", async () => {
    const { findExpiredLeases } =
      await import("../../harness/ops/core/symphony-state/find-expired-leases.mjs");

    const store = emptyStore();
    store.issues["ANQ-ACTIVE"] = {
      issueIdentifier: "ANQ-ACTIVE",
      lease: makeActiveLease(),
    };
    rawStateOnDisk = store;

    const expired = findExpiredLeases();
    expect(expired).toHaveLength(0);
  });

  it("should ignore issues without leases", async () => {
    const { findExpiredLeases } =
      await import("../../harness/ops/core/symphony-state/find-expired-leases.mjs");

    const store = emptyStore();
    store.issues["ANQ-NOLEASE"] = {
      issueIdentifier: "ANQ-NOLEASE",
    };
    rawStateOnDisk = store;

    const expired = findExpiredLeases();
    expect(expired).toHaveLength(0);
  });

  it("should return multiple expired leases from mixed state", async () => {
    const { findExpiredLeases } =
      await import("../../harness/ops/core/symphony-state/find-expired-leases.mjs");

    const store = emptyStore();
    store.issues["ANQ-MIX-A"] = {
      issueIdentifier: "ANQ-MIX-A",
      lease: makeExpiredLease(),
    };
    store.issues["ANQ-MIX-B"] = {
      issueIdentifier: "ANQ-MIX-B",
      lease: makeActiveLease(),
    };
    store.issues["ANQ-MIX-C"] = {
      issueIdentifier: "ANQ-MIX-C",
      lease: { ...makeExpiredLease(), nonce: "expired-nonce-002" },
    };
    store.issues["ANQ-MIX-D"] = {
      issueIdentifier: "ANQ-MIX-D",
      // no lease
    };
    rawStateOnDisk = store;

    const expired = findExpiredLeases();
    expect(expired).toHaveLength(2);
    const ids = expired.map((e: { issueIdentifier: string }) => e.issueIdentifier);
    expect(ids).toContain("ANQ-MIX-A");
    expect(ids).toContain("ANQ-MIX-C");
  });

  it("should accept custom timestamp for testing lease expiry boundary", async () => {
    const { findExpiredLeases } =
      await import("../../harness/ops/core/symphony-state/find-expired-leases.mjs");

    const store = emptyStore();
    store.issues["ANQ-BOUNDARY"] = {
      issueIdentifier: "ANQ-BOUNDARY",
      lease: {
        ...makeActiveLease(),
        expires_at: "2026-04-15T12:00:00.000Z",
      },
    };
    rawStateOnDisk = store;

    // Just before expiry — not expired
    const before = findExpiredLeases(new Date("2026-04-15T11:59:59.999Z").getTime());
    expect(before).toHaveLength(0);

    // At expiry — expired (<=)
    const at = findExpiredLeases(new Date("2026-04-15T12:00:00.000Z").getTime());
    expect(at).toHaveLength(1);

    // After expiry — expired
    const after = findExpiredLeases(new Date("2026-04-15T12:00:01.000Z").getTime());
    expect(after).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 2. releaseLease on expired/stale leases
// ---------------------------------------------------------------------------

describe("releaseLease stale lease handling (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should clean up expired lease without transition validation", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");

    // Set up issue with expired lease
    const store = emptyStore();
    store.issues["ANQ-STALE-1"] = normalizeRecord({
      issueIdentifier: "ANQ-STALE-1",
      lease: makeExpiredLease(),
      assignment: { worktreeId: "wt1" },
    });
    store.worktreeStates["wt1"] = {
      state: "executing",
      assignedIssue: "ANQ-STALE-1",
    };
    rawStateOnDisk = store;

    // Release expired lease
    const result = releaseLease("ANQ-STALE-1");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(true);

    // Lease is cleared
    const issue = getIssueState("ANQ-STALE-1");
    expect(issue.lease).toBeNull();
  });

  it("should clear worktree ownership when releasing expired lease (bidirectional)", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Set up issue with expired lease and assigned worktree
    const store = emptyStore();
    store.issues["ANQ-STALE-2"] = normalizeRecord({
      issueIdentifier: "ANQ-STALE-2",
      lease: makeExpiredLease(),
      assignment: { worktreeId: "wt2" },
    });
    store.worktreeStates["wt2"] = {
      state: "executing",
      assignedIssue: "ANQ-STALE-2",
    };
    rawStateOnDisk = store;

    const result = releaseLease("ANQ-STALE-2");
    expect(result.ok).toBe(true);

    // Worktree is freed
    const wt = getWorktreeState("wt2");
    expect(wt.state).toBe("available");
    expect(wt.assignedIssue).toBeNull();
  });

  it("should return ok with released=false when no lease exists", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");

    const store = emptyStore();
    store.issues["ANQ-NOLEASE"] = normalizeRecord({
      issueIdentifier: "ANQ-NOLEASE",
    });
    rawStateOnDisk = store;

    const result = releaseLease("ANQ-NOLEASE");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. releaseLease nonce mismatch
// ---------------------------------------------------------------------------

describe("releaseLease nonce mismatch (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should reject release when nonce does not match", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getIssueState } =
      await import("../../harness/ops/core/symphony-state/get-issue-state.mjs");

    // Set up issue with active lease
    const store = emptyStore();
    store.issues["ANQ-NONCE"] = normalizeRecord({
      issueIdentifier: "ANQ-NONCE",
      lease: makeActiveLease(),
      assignment: { worktreeId: "wt1" },
    });
    store.worktreeStates["wt1"] = {
      state: "executing",
      assignedIssue: "ANQ-NONCE",
    };
    rawStateOnDisk = store;

    // Wrong nonce → rejected
    const result = releaseLease("ANQ-NONCE", "wrong-nonce");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("lease_mismatch");

    // Lease is still active
    expect(getIssueState("ANQ-NONCE").lease).toBeTruthy();
  });

  it("should accept release when nonce matches", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");

    const store = emptyStore();
    const lease = makeActiveLease();
    store.issues["ANQ-NONCE-OK"] = normalizeRecord({
      issueIdentifier: "ANQ-NONCE-OK",
      lease,
    });
    rawStateOnDisk = store;

    const result = releaseLease("ANQ-NONCE-OK", lease.nonce);
    expect(result.ok).toBe(true);
    expect(result.released).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Orphaned assignment clearing
// ---------------------------------------------------------------------------

describe("Orphaned assignment clearing (Phase 6)", () => {
  beforeEach(() => {
    rawStateOnDisk = emptyStore();
  });

  it("should clear orphaned worktree when issue lease is released", async () => {
    const { claimAndAssignWorktree } =
      await import("../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs");
    const { acquireLease } =
      await import("../../harness/ops/core/symphony-state/acquire-lease.mjs");
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { getWorktreeOwner } =
      await import("../../harness/ops/core/symphony-state/get-worktree-owner.mjs");

    // Normal claim + lease
    claimAndAssignWorktree("ANQ-ORPHAN-1", { worktreeId: "wt1" });
    acquireLease("ANQ-ORPHAN-1", { runId: "run-o1" });

    // Worktree is executing and owned
    expect(getWorktreeState("wt1").state).toBe("executing");
    expect(getWorktreeOwner("wt1")).toBe("ANQ-ORPHAN-1");

    // Release lease — should clear worktree too (bidirectional)
    releaseLease("ANQ-ORPHAN-1");

    // Worktree is now available — no orphan
    expect(getWorktreeState("wt1").state).toBe("available");
    expect(getWorktreeOwner("wt1")).toBeNull();
  });

  it("should handle worktree with expired lease assignment", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");
    const { findExpiredLeases } =
      await import("../../harness/ops/core/symphony-state/find-expired-leases.mjs");

    // Simulate a crash scenario: issue has expired lease, worktree is still executing
    const store = emptyStore();
    store.issues["ANQ-CRASH"] = normalizeRecord({
      issueIdentifier: "ANQ-CRASH",
      lease: makeExpiredLease(),
      assignment: { worktreeId: "wt3" },
    });
    store.worktreeStates["wt3"] = {
      state: "executing",
      assignedIssue: "ANQ-CRASH",
    };
    rawStateOnDisk = store;

    // Detect the expired lease
    const expired = findExpiredLeases();
    expect(expired).toHaveLength(1);
    expect(expired[0].issueIdentifier).toBe("ANQ-CRASH");

    // Release the expired lease — should clean up worktree too
    const result = releaseLease("ANQ-CRASH");
    expect(result.ok).toBe(true);
    expect(result.released).toBe(true);

    // Worktree is freed
    const wt = getWorktreeState("wt3");
    expect(wt.state).toBe("available");
    expect(wt.assignedIssue).toBeNull();

    // No more expired leases
    expect(findExpiredLeases()).toHaveLength(0);
  });

  it("should handle finalization worktreeId for orphan clearing", async () => {
    const { releaseLease } =
      await import("../../harness/ops/core/symphony-state/release-lease.mjs");
    const { getWorktreeState } =
      await import("../../harness/ops/core/symphony-state/get-worktree-state.mjs");

    // Issue has worktreeId in finalization (not assignment) — this is the
    // fallback path in releaseLease for finding the worktree to clear
    const store = emptyStore();
    store.issues["ANQ-FIN-ORPHAN"] = normalizeRecord({
      issueIdentifier: "ANQ-FIN-ORPHAN",
      lease: makeExpiredLease(),
      finalization: { state: "integration_pending", worktreeId: "wt2" },
    });
    store.worktreeStates["wt2"] = {
      state: "executing",
      assignedIssue: "ANQ-FIN-ORPHAN",
    };
    rawStateOnDisk = store;

    const result = releaseLease("ANQ-FIN-ORPHAN");
    expect(result.ok).toBe(true);

    // Worktree freed via finalization.worktreeId lookup
    const wt = getWorktreeState("wt2");
    expect(wt.state).toBe("available");
    expect(wt.assignedIssue).toBeNull();
  });
});
