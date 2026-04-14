import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Assignment persistence roundtrip tests — Phase 0 A-integrity hotfix.
 *
 * Proves:
 * 1. normalizeRecord preserves the assignment field (the root bug)
 * 2. claim → save → load (with normalization) → getIssueState preserves assignment
 * 3. claim → save → fresh load → verifySchedulerClaim passes (restart semantics)
 * 4. patchIssueState does not drop existing assignment
 *
 * These tests exercise the REAL normalizeRecord and claimIssue modules.
 * The loadState mock faithfully mirrors the real loadState implementation
 * (including normalizeRecord on every issue) to prove the full roundtrip.
 */

// ---------------------------------------------------------------------------
// State storage — simulates the on-disk state.json
// saveState writes here; loadState reads and normalizes from here
// ---------------------------------------------------------------------------

let rawStateOnDisk: Record<string, unknown> = {};

// We need normalizeRecord to be real — it's the module under test.
// Import it eagerly so the loadState mock can use it.
const { normalizeRecord } = await import(
  "../../harness/ops/core/symphony-state/normalize-record.mjs"
);

// ---------------------------------------------------------------------------
// Mock only the I/O and lock layers — let normalizeRecord run for real
// ---------------------------------------------------------------------------

vi.mock("../../harness/ops/core/symphony-state/save-state.mjs", () => ({
  saveState: (store: unknown) => {
    // Simulates writing state.json to disk (raw JSON, no normalization)
    rawStateOnDisk = JSON.parse(JSON.stringify(store));
  },
}));

vi.mock("../../harness/ops/core/symphony-state/load-state.mjs", () => ({
  loadState: () => {
    // Faithfully mirrors the real loadState: reads raw JSON then normalizes
    // each issue record through normalizeRecord. This is the critical path
    // that was dropping assignment before the fix.
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

vi.mock("../../harness/ops/core/symphony-state/default-lease-ms.mjs", () => ({
  DEFAULT_LEASE_MS: 1_200_000,
}));

vi.mock("../../harness/ops/core/symphony-state/now-iso.mjs", () => ({
  nowIso: () => new Date().toISOString(),
}));

// ---------------------------------------------------------------------------
// Direct normalizeRecord tests — proves the root fix
// ---------------------------------------------------------------------------

describe("normalizeRecord preserves assignment — Phase 0 regression", () => {
  it("should preserve assignment field through normalization", () => {
    const record = {
      issueIdentifier: "ANQ-100",
      lease: {
        owner: "scheduler",
        nonce: "scheduler-test-1",
        run_id: null,
        acquired_at: new Date().toISOString(),
        heartbeat_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1_200_000).toISOString(),
      },
      assignment: {
        worktreeId: "wt3",
        source: "scheduler",
        correlationId: "corr-123",
        claimedAt: new Date().toISOString(),
        claimedBy: "scheduler",
      },
    };

    const normalized = normalizeRecord(record);

    expect(normalized.assignment).not.toBeNull();
    expect(normalized.assignment!.worktreeId).toBe("wt3");
    expect(normalized.assignment!.source).toBe("scheduler");
    expect(normalized.assignment!.correlationId).toBe("corr-123");
    expect(normalized.assignment!.claimedBy).toBe("scheduler");
    expect(normalized.assignment!.claimedAt).toBeDefined();
  });

  it("should return null assignment when no assignment exists", () => {
    const record = { issueIdentifier: "ANQ-200" };
    const normalized = normalizeRecord(record);
    expect(normalized.assignment).toBeNull();
  });

  it("should return null assignment for non-object assignment", () => {
    const record = { issueIdentifier: "ANQ-300", assignment: "invalid" };
    const normalized = normalizeRecord(record);
    expect(normalized.assignment).toBeNull();
  });

  it("should handle partial assignment fields gracefully", () => {
    const record = {
      issueIdentifier: "ANQ-400",
      assignment: { worktreeId: "wt1" },
    };
    const normalized = normalizeRecord(record);
    expect(normalized.assignment).not.toBeNull();
    expect(normalized.assignment!.worktreeId).toBe("wt1");
    expect(normalized.assignment!.source).toBeNull();
    expect(normalized.assignment!.correlationId).toBeNull();
    expect(normalized.assignment!.claimedAt).toBeNull();
    expect(normalized.assignment!.claimedBy).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Roundtrip tests — claim → save → load (normalized) → read
// ---------------------------------------------------------------------------

describe("Assignment roundtrip — claim → save → load → getIssueState", () => {
  beforeEach(() => {
    rawStateOnDisk = {
      version: 1,
      updatedAt: "",
      hostId: "test",
      global: { integrationQueue: [], integrationLock: null },
      issues: {},
      worktreeStates: {},
    };
  });

  it("should preserve assignment through claim → save → load → getIssueState", async () => {
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { getIssueState } = await import(
      "../../harness/ops/core/symphony-state/get-issue-state.mjs"
    );

    // Step 1: Claim issue (writes lease + assignment to state)
    const claimResult = claimIssue("ANQ-RT-100", {
      worktreeId: "wt2",
      source: "scheduler",
      correlationId: "corr-rt-100",
    });
    expect(claimResult.ok).toBe(true);
    expect(claimResult.assignment.worktreeId).toBe("wt2");

    // Step 2: Read state back through getIssueState
    // This calls loadState (which normalizes) then normalizeRecord again.
    // Before the fix, assignment was silently dropped here.
    const state = getIssueState("ANQ-RT-100");

    // Step 3: Prove assignment survived the full roundtrip
    expect(state.assignment).not.toBeNull();
    const assignment = state.assignment as Record<string, unknown>;
    expect(assignment.worktreeId).toBe("wt2");
    expect(assignment.source).toBe("scheduler");
    expect(assignment.correlationId).toBe("corr-rt-100");
    expect(assignment.claimedBy).toBe("scheduler");
    expect(assignment.claimedAt).toBeDefined();
  });

  it("should preserve lease through claim → save → load → getIssueState", async () => {
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { getIssueState } = await import(
      "../../harness/ops/core/symphony-state/get-issue-state.mjs"
    );

    claimIssue("ANQ-RT-200", { worktreeId: "wt1" });
    const state = getIssueState("ANQ-RT-200");

    expect(state.lease).not.toBeNull();
    expect(state.lease.owner).toBe("scheduler");
    expect(new Date(state.lease.expires_at).getTime()).toBeGreaterThan(Date.now());
  });
});

// ---------------------------------------------------------------------------
// Restart semantics — claim → save → fresh load → verifySchedulerClaim
// ---------------------------------------------------------------------------

describe("Restart semantics — verifySchedulerClaim after load", () => {
  beforeEach(() => {
    rawStateOnDisk = {
      version: 1,
      updatedAt: "",
      hostId: "test",
      global: { integrationQueue: [], integrationLock: null },
      issues: {},
      worktreeStates: {},
    };
  });

  it("should pass verifySchedulerClaim after save → fresh load (restart proof)", async () => {
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { verifySchedulerClaim } = await import(
      "../../harness/ops/integrations/model/symphony-agent-router/verify-scheduler-claim.mjs"
    );

    // Step 1: Scheduler claims an issue
    const claimResult = claimIssue("ANQ-RS-100", {
      worktreeId: "wt3",
      source: "scheduler",
      correlationId: "corr-rs-100",
    });
    expect(claimResult.ok).toBe(true);

    // Step 2: Simulate restart — verifySchedulerClaim reads from loadState
    // which normalizes from the "disk" state. Before the fix, this returned
    // { allowed: false, reason: "no_worktree_assignment" } because
    // normalizeRecord dropped the assignment field.
    const verification = verifySchedulerClaim("ANQ-RS-100");

    // Step 3: Router claim verification must pass after restart
    expect(verification.allowed).toBe(true);
    expect(verification.assignedWorktreeId).toBe("wt3");
  });

  it("should fail verifySchedulerClaim for unclaimed issue after restart", async () => {
    const { verifySchedulerClaim } = await import(
      "../../harness/ops/integrations/model/symphony-agent-router/verify-scheduler-claim.mjs"
    );

    const verification = verifySchedulerClaim("ANQ-RS-200");
    expect(verification.allowed).toBe(false);
    expect(verification.reason).toBe("no_active_claim");
  });
});

// ---------------------------------------------------------------------------
// patchIssueState must not drop assignment
// ---------------------------------------------------------------------------

describe("patchIssueState preserves assignment", () => {
  beforeEach(() => {
    rawStateOnDisk = {
      version: 1,
      updatedAt: "",
      hostId: "test",
      global: { integrationQueue: [], integrationLock: null },
      issues: {},
      worktreeStates: {},
    };
  });

  it("should preserve assignment when patching unrelated fields", async () => {
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { patchIssueState } = await import(
      "../../harness/ops/core/symphony-state/patch-issue-state.mjs"
    );

    // Claim issue (creates assignment)
    claimIssue("ANQ-PI-100", { worktreeId: "wt4", source: "scheduler" });

    // Patch an unrelated field — this calls normalizeRecord({ ...current, ...patch })
    // Before the fix, this would drop assignment because normalizeRecord didn't include it
    const patched = patchIssueState("ANQ-PI-100", {
      last_failure_reason: "test_failure",
    });

    expect(patched.assignment).not.toBeNull();
    const patchedAssignment = patched.assignment as Record<string, unknown>;
    expect(patchedAssignment.worktreeId).toBe("wt4");
    expect(patchedAssignment.claimedBy).toBe("scheduler");
    expect(patched.last_failure_reason).toBe("test_failure");
  });

  it("should preserve assignment through multiple patches", async () => {
    const { claimIssue } = await import(
      "../../harness/ops/core/symphony-state/claim-issue.mjs"
    );
    const { patchIssueState } = await import(
      "../../harness/ops/core/symphony-state/patch-issue-state.mjs"
    );

    claimIssue("ANQ-PI-200", { worktreeId: "wt1" });

    patchIssueState("ANQ-PI-200", { retry_count: 1 });
    patchIssueState("ANQ-PI-200", { last_run_id: "run-abc" });
    const final = patchIssueState("ANQ-PI-200", { latency_ms: 5000 });

    expect(final.assignment).not.toBeNull();
    const finalAssignment = final.assignment as Record<string, unknown>;
    expect(finalAssignment.worktreeId).toBe("wt1");
    expect(final.retry_count).toBe(1);
    expect(final.last_run_id).toBe("run-abc");
    expect(final.latency_ms).toBe(5000);
  });
});
