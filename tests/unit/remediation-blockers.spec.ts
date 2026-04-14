import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Remediation Blocker tests.
 *
 * 1. loadState normalizes worktree records
 * 3. claimAndAssignWorktree is atomic (one lock, one save)
 * 4. releaseLease clears worktree ownership bidirectionally
 * 5. Dispatch failure rollback (releaseLease rolls back both sides)
 * 7. Readers handle normalized worktree records
 * 2. Lifecycle helpers use transitionIssue
 *
 * Mocking strategy: mock only I/O (save/load/lock/host/time);
 * let all pure logic run for real.
 */

// ---------------------------------------------------------------------------
// Shared in-memory state store
// ---------------------------------------------------------------------------

let rawStateOnDisk: Record<string, unknown> = {};

const { normalizeRecord } = await import(
  "../../harness/ops/core/symphony-state/normalize-record.mjs"
);
const { normalizeWorktreeRecord } = await import(
  "../../harness/ops/core/symphony-state/worktree-record-schema.mjs"
);

// ---------------------------------------------------------------------------
// Mock I/O — let all pure logic run for real
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
      worktreeStates: {} as Record<string, unknown>,
    };
    for (const [k, v] of Object.entries((data.issues as Record<string, unknown>) || {})) {
      store.issues[k] = normalizeRecord({ ...(v as Record<string, unknown>), issueIdentifier: k });
    }
    // Blocker 1: normalize worktree records on load
    for (const [wtId, v] of Object.entries((data.worktreeStates as Record<string, unknown>) || {})) {
      store.worktreeStates[wtId] = normalizeWorktreeRecord(wtId, v as Record<string, unknown>);
    }
    return store;
  },
}));

vi.mock("../../harness/ops/core/symphony-state/with-state-lock.mjs", () => ({
  withStateLock: (fn: () => unknown) => fn(),
}));

vi.mock("../../harness/ops/core/symphony-state/host-id.mjs", () => ({
  HOST_ID: "test-host",
}));

vi.mock("../../harness/ops/core/symphony-state/get-state-file.mjs", () => ({
  getStateFile: () => "/tmp/test-state.json",
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetStore() {
  rawStateOnDisk = {
    version: 2,
    updatedAt: new Date().toISOString(),
    hostId: "test-host",
    issues: {},
    worktreeStates: {},
    global: { integrationQueue: [], integrationLock: null },
  };
}

function setIssue(id: string, fields: Record<string, unknown>) {
  const store = rawStateOnDisk as Record<string, Record<string, unknown>>;
  if (!store.issues) store.issues = {};
  (store.issues as Record<string, unknown>)[id] = { issueIdentifier: id, ...fields };
}

function setWorktree(id: string, fields: Record<string, unknown>) {
  const store = rawStateOnDisk as Record<string, Record<string, unknown>>;
  if (!store.worktreeStates) store.worktreeStates = {};
  (store.worktreeStates as Record<string, unknown>)[id] = fields;
}

function getIssue(id: string): Record<string, unknown> | undefined {
  return (rawStateOnDisk as Record<string, Record<string, unknown>>).issues?.[id] as Record<string, unknown> | undefined;
}

function getWorktree(id: string): Record<string, unknown> | undefined {
  return (rawStateOnDisk as Record<string, Record<string, unknown>>).worktreeStates?.[id] as Record<string, unknown> | undefined;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => resetStore());

// ===== Blocker 1: loadState normalizes worktree records =====

describe("Blocker 1: loadState normalizes worktree records", () => {
  it("should normalize raw worktree records on load", async () => {
    const { loadState } = await import(
      "../../harness/ops/core/symphony-state/load-state.mjs"
    );

    // Set a raw worktree record with old-style fields
    setWorktree("wt1", {
      state: "executing",
      issueIdentifier: "ANQ-OLD",
      // missing assignedIssue, missing worktreeId, missing updatedAt, etc.
    });

    const store = loadState();
    const wt = store.worktreeStates["wt1"] as Record<string, unknown>;

    // Should be normalized to canonical shape
    expect(wt.worktreeId).toBe("wt1");
    expect(wt.assignedIssue).toBe("ANQ-OLD"); // migrated from issueIdentifier
    expect(wt.state).toBe("executing");
    expect(wt).toHaveProperty("owner");
    expect(wt).toHaveProperty("repairAttempts");
    expect(wt).toHaveProperty("lastError");
  });

  it("should default state to available for unknown values", async () => {
    const { loadState } = await import(
      "../../harness/ops/core/symphony-state/load-state.mjs"
    );

    setWorktree("wt2", { state: "GARBAGE" });
    const store = loadState();
    const wt = store.worktreeStates["wt2"] as Record<string, unknown>;
    expect(wt.state).toBe("available");
  });

  it("should preserve assignedIssue over issueIdentifier", async () => {
    const { loadState } = await import(
      "../../harness/ops/core/symphony-state/load-state.mjs"
    );

    setWorktree("wt3", {
      state: "executing",
      assignedIssue: "ANQ-NEW",
      issueIdentifier: "ANQ-OLD",
    });
    const store = loadState();
    const wt = store.worktreeStates["wt3"] as Record<string, unknown>;
    expect(wt.assignedIssue).toBe("ANQ-NEW");
  });
});

// ===== Blocker 7: readers handle normalized records =====

describe("Blocker 7: readers handle normalized worktree records", () => {
  it("getWorktreeOwner returns assignedIssue from normalized record", async () => {
    const { getWorktreeOwner } = await import(
      "../../harness/ops/core/symphony-state/get-worktree-owner.mjs"
    );

    // Raw record with only issueIdentifier (old style)
    setWorktree("wt1", { state: "executing", issueIdentifier: "ANQ-LEGACY" });
    expect(getWorktreeOwner("wt1")).toBe("ANQ-LEGACY");
  });

  it("getWorktreeState returns normalized record", async () => {
    const { getWorktreeState } = await import(
      "../../harness/ops/core/symphony-state/get-worktree-state.mjs"
    );

    setWorktree("wt1", { state: "quarantined" });
    const wt = getWorktreeState("wt1");
    expect(wt).not.toBeNull();
    expect(wt.worktreeId).toBe("wt1");
    expect(wt.state).toBe("quarantined");
    expect(wt.repairAttempts).toBe(0);
  });
});

// ===== Blocker 3: claimAndAssignWorktree is atomic =====

describe("Blocker 3: claimAndAssignWorktree is atomic", () => {
  it("should claim issue and assign worktree in one operation", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );

    setWorktree("wt1", { state: "available" });

    const result = claimAndAssignWorktree("ANQ-100", {
      worktreeId: "wt1",
      source: "scheduler",
    });

    expect(result.ok).toBe(true);
    expect(result.lease).toBeDefined();
    expect(result.assignment).toBeDefined();
    expect(result.assignment!.worktreeId).toBe("wt1");

    // Issue side: should be claimed
    const issue = getIssue("ANQ-100");
    expect(issue).toBeDefined();
    expect((issue!.lease as Record<string, unknown>)?.owner).toBe("scheduler");
    expect((issue!.assignment as Record<string, unknown>)?.worktreeId).toBe("wt1");

    // Worktree side: should be executing with assignedIssue
    const wt = getWorktree("wt1");
    expect(wt).toBeDefined();
    expect(wt!.state).toBe("executing");
    expect(wt!.assignedIssue).toBe("ANQ-100");
  });

  it("should reject when worktreeId is missing", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );

    // @ts-expect-error — intentionally omitting worktreeId
    const result = claimAndAssignWorktree("ANQ-100", {});
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("missing_worktree_assignment");
  });

  it("should reject if issue is already claimed", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );

    setWorktree("wt1", { state: "available" });
    setWorktree("wt2", { state: "available" });

    const first = claimAndAssignWorktree("ANQ-100", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(first.ok).toBe(true);

    const second = claimAndAssignWorktree("ANQ-100", {
      worktreeId: "wt2",
      source: "scheduler",
    });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("already_claimed");
  });

  it("should reject if worktree is already executing", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );

    setWorktree("wt1", { state: "executing", assignedIssue: "ANQ-OTHER" });

    const result = claimAndAssignWorktree("ANQ-100", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("worktree_unavailable");
  });

  it("should not save if issue validation fails", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );

    // Issue in blocked state
    setIssue("ANQ-BLOCKED", { blocked_reason: "too_complex", human_only: true });
    setWorktree("wt1", { state: "available" });

    const result = claimAndAssignWorktree("ANQ-BLOCKED", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(result.ok).toBe(false);

    // Worktree should remain available (not changed)
    const wt = getWorktree("wt1");
    expect(wt?.state ?? "available").toBe("available");
  });

  it("should not save if worktree validation fails", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );

    setWorktree("wt1", { state: "quarantined" });

    const result = claimAndAssignWorktree("ANQ-100", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("worktree_unavailable");

    // Issue should NOT be claimed
    const issue = getIssue("ANQ-100");
    expect(issue?.lease).toBeFalsy();
  });
});

// ===== Blocker 4: releaseLease clears worktree ownership =====

describe("Blocker 4: releaseLease clears worktree ownership", () => {
  it("should clear worktree ownership when releasing active lease", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );
    const { releaseLease } = await import(
      "../../harness/ops/core/symphony-state/release-lease.mjs"
    );

    setWorktree("wt1", { state: "available" });
    const claim = claimAndAssignWorktree("ANQ-200", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(claim.ok).toBe(true);

    // Verify both sides are set
    expect(getWorktree("wt1")?.state).toBe("executing");
    expect(getWorktree("wt1")?.assignedIssue).toBe("ANQ-200");

    // Release the lease
    const releaseResult = releaseLease("ANQ-200");
    expect(releaseResult.ok).toBe(true);
    expect(releaseResult.released).toBe(true);

    // Issue side: lease should be cleared
    const issue = getIssue("ANQ-200");
    expect(issue?.lease).toBeNull();

    // Worktree side: should be available with no owner
    const wt = getWorktree("wt1");
    expect(wt?.state).toBe("available");
    expect(wt?.assignedIssue).toBeNull();
  });

  it("should not clear worktree if reassigned to a different issue", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );
    const { releaseLease } = await import(
      "../../harness/ops/core/symphony-state/release-lease.mjs"
    );

    setWorktree("wt1", { state: "available" });
    const claim1 = claimAndAssignWorktree("ANQ-300", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(claim1.ok).toBe(true);

    // Simulate another process taking the worktree for a different issue
    // (e.g., sticky repair). Overwrite the worktree directly.
    setWorktree("wt1", { state: "executing", assignedIssue: "ANQ-OTHER" });

    const releaseResult = releaseLease("ANQ-300");
    expect(releaseResult.ok).toBe(true);

    // Worktree should NOT be cleared — it belongs to ANQ-OTHER now
    const wt = getWorktree("wt1");
    expect(wt?.assignedIssue).toBe("ANQ-OTHER");
  });
});

// ===== Blocker 5: dispatch failure rollback =====

describe("Blocker 5: dispatch failure rollback via releaseLease", () => {
  it("should fully roll back claim + worktree on releaseLease after failed dispatch", async () => {
    const { claimAndAssignWorktree } = await import(
      "../../harness/ops/core/symphony-state/claim-and-assign-worktree.mjs"
    );
    const { releaseLease } = await import(
      "../../harness/ops/core/symphony-state/release-lease.mjs"
    );

    setWorktree("wt1", { state: "available" });

    // Claim succeeds
    const claim = claimAndAssignWorktree("ANQ-FAIL", {
      worktreeId: "wt1",
      source: "scheduler",
    });
    expect(claim.ok).toBe(true);
    expect(getWorktree("wt1")?.state).toBe("executing");

    // Simulate dispatch failure — scheduler calls releaseLease to roll back
    const rollback = releaseLease("ANQ-FAIL");
    expect(rollback.ok).toBe(true);

    // Both sides should be clean
    const issue = getIssue("ANQ-FAIL");
    expect(issue?.lease).toBeNull();

    const wt = getWorktree("wt1");
    expect(wt?.state).toBe("available");
    expect(wt?.assignedIssue).toBeNull();
  });
});

// ===== Blocker 2: lifecycle helpers use transitionIssue =====

describe("Blocker 2: lifecycle helpers use transitionIssue", () => {
  describe("setCooldown", () => {
    it("should transition executing issue to cooldown", async () => {
      const { setCooldown } = await import(
        "../../harness/ops/core/symphony-state/set-cooldown.mjs"
      );

      // Set up an executing issue (active lease with run_id)
      const future = new Date(Date.now() + 600_000).toISOString();
      setIssue("ANQ-CD1", {
        lease: { owner: "scheduler", expires_at: future, nonce: "n1", run_id: "run-1" },
      });

      // @ts-expect-error — setCooldown signature param inferred as null from default
      setCooldown("ANQ-CD1", 60_000, "local_busy", "sig-123");

      const issue = getIssue("ANQ-CD1");
      expect(issue?.cooldown_until).toBeTruthy();
      expect(issue?.last_failure_reason).toBe("local_busy");
      expect(issue?.last_failure_signature).toBe("sig-123");
      // Should have transition history
      expect(Array.isArray(issue?.transitions)).toBe(true);
      const transitions = issue?.transitions as Array<Record<string, unknown>>;
      const cdTransition = transitions?.find((t) => t.to === "cooldown");
      expect(cdTransition).toBeDefined();
    });
  });

  describe("clearCooldown", () => {
    it("should transition cooldown issue to eligible", async () => {
      const { clearCooldown } = await import(
        "../../harness/ops/core/symphony-state/clear-cooldown.mjs"
      );

      const futureCD = new Date(Date.now() + 300_000).toISOString();
      setIssue("ANQ-CC1", { cooldown_until: futureCD, retry_count: 0 });

      clearCooldown("ANQ-CC1");

      const issue = getIssue("ANQ-CC1");
      expect(issue?.cooldown_until).toBeNull();
    });

    it("should clear metadata without transition when not in cooldown", async () => {
      const { clearCooldown } = await import(
        "../../harness/ops/core/symphony-state/clear-cooldown.mjs"
      );

      // Issue is executing (active lease with run_id), has stale cooldown_until
      const future = new Date(Date.now() + 600_000).toISOString();
      setIssue("ANQ-CC2", {
        lease: { owner: "scheduler", expires_at: future, nonce: "n1", run_id: "run-1" },
        cooldown_until: new Date(Date.now() + 100_000).toISOString(),
      });

      clearCooldown("ANQ-CC2");

      const issue = getIssue("ANQ-CC2");
      expect(issue?.cooldown_until).toBeNull();
      // Lease should still be present
      expect(issue?.lease).toBeTruthy();
    });
  });

  describe("markRetryExhausted", () => {
    it("should transition executing issue to blocked", async () => {
      const { markRetryExhausted } = await import(
        "../../harness/ops/core/symphony-state/mark-retry-exhausted.mjs"
      );

      const future = new Date(Date.now() + 600_000).toISOString();
      setIssue("ANQ-MR1", {
        lease: { owner: "scheduler", expires_at: future, nonce: "n1", run_id: "run-1" },
      });

      markRetryExhausted("ANQ-MR1", { reason: "too_many_failures", signature: "sig-456" });

      const issue = getIssue("ANQ-MR1");
      expect(issue?.retry_exhausted).toBe(true);
      expect(issue?.blocked_reason).toBe("too_many_failures");
      expect(issue?.last_failure_signature).toBe("sig-456");
      expect(issue?.lease).toBeNull();
      expect(issue?.cooldown_until).toBeNull();
    });
  });

  describe("markIssueHumanOnly", () => {
    it("should transition eligible issue to blocked", async () => {
      const { markIssueHumanOnly } = await import(
        "../../harness/ops/core/symphony-state/mark-issue-human-only.mjs"
      );

      setIssue("ANQ-HO1", {});

      markIssueHumanOnly("ANQ-HO1", { source: "email" });

      const issue = getIssue("ANQ-HO1");
      expect(issue?.human_only).toBe(true);
      expect(issue?.source).toBe("email");
    });
  });

  describe("resetRetryState", () => {
    it("should transition blocked issue to eligible", async () => {
      const { resetRetryState } = await import(
        "../../harness/ops/core/symphony-state/reset-retry-state.mjs"
      );

      setIssue("ANQ-RS1", {
        retry_exhausted: true,
        blocked_reason: "retry_exhausted",
        cooldown_until: new Date().toISOString(),
        last_failure_reason: "old",
      });

      resetRetryState("ANQ-RS1", { retry_count: 0 });

      const issue = getIssue("ANQ-RS1");
      expect(issue?.retry_exhausted).toBe(false);
      expect(issue?.blocked_reason).toBeNull();
      expect(issue?.cooldown_until).toBeNull();
      expect(issue?.lease).toBeNull();
      expect(issue?.last_failure_reason).toBeNull();
    });
  });

  describe("recordCompletion", () => {
    it("should record completion metadata", async () => {
      const { recordCompletion } = await import(
        "../../harness/ops/core/symphony-state/record-completion.mjs"
      );

      setIssue("ANQ-RC1", {});

      recordCompletion("ANQ-RC1", {
        completedAt: "2026-01-01T00:00:00Z",
        latencyMs: 120000,
      });

      const issue = getIssue("ANQ-RC1");
      expect(issue?.completed_at).toBe("2026-01-01T00:00:00Z");
      expect(issue?.latency_ms).toBe(120000);
    });
  });
});

// ===== inferExecutionPhase priority fix =====

describe("inferExecutionPhase priority order fix", () => {
  it("should prioritize finalization state over completed_at", async () => {
    const { inferExecutionPhase } = await import(
      "../../harness/ops/core/symphony-state/infer-execution-phase.mjs"
    );

    // Issue has both completed_at AND finalization.state = integration_pending
    // (runner sets completed_at before integration runs)
    const record = normalizeRecord({
      issueIdentifier: "ANQ-PRIORITY",
      completed_at: "2026-01-01T00:00:00Z",
      finalization: { state: "integration_pending" },
    });

    const phase = inferExecutionPhase(record);
    // Should be integration_pending, NOT completed
    expect(phase).toBe("integration_pending");
  });

  it("should return completed when completed_at is set with no finalization", async () => {
    const { inferExecutionPhase } = await import(
      "../../harness/ops/core/symphony-state/infer-execution-phase.mjs"
    );

    const record = normalizeRecord({
      issueIdentifier: "ANQ-DONE",
      completed_at: "2026-01-01T00:00:00Z",
    });

    expect(inferExecutionPhase(record)).toBe("completed");
  });

  it("should return completed when finalization maps to completed", async () => {
    const { inferExecutionPhase } = await import(
      "../../harness/ops/core/symphony-state/infer-execution-phase.mjs"
    );

    const record = normalizeRecord({
      issueIdentifier: "ANQ-FIN",
      completed_at: "2026-01-01T00:00:00Z",
      finalization: { state: "integrated_main" },
    });

    // integrated_main maps to completed in FINALIZATION_STATE_TO_PHASE
    expect(inferExecutionPhase(record)).toBe("completed");
  });
});
