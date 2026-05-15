import { describe, it, expect } from "vitest";

/**
 * Workstream B Phase 1 — State model definition tests.
 *
 * Tests all four Phase 1 modules:
 * 1. issue-phases.mjs — ISSUE_PHASES enum, FINALIZATION_STATE_TO_PHASE, VALID_ISSUE_PHASES
 * 2. worktree-record-schema.mjs — WORKTREE_STATES, normalizeWorktreeRecord()
 * 3. transition-map.mjs — isValidIssueTransition(), isValidWorktreeTransition()
 * 4. infer-execution-phase.mjs — inferExecutionPhase()
 *
 * These tests import the REAL modules with no mocking — they are pure logic.
 */

// ---------------------------------------------------------------------------
// Imports — all real, no mocks needed for pure enum/logic modules
// ---------------------------------------------------------------------------

const { ISSUE_PHASES, FINALIZATION_STATE_TO_PHASE, VALID_ISSUE_PHASES } =
  await import("../../harness/ops/core/symphony-state/issue-phases.mjs");

const { WORKTREE_STATES, VALID_WORKTREE_STATES, normalizeWorktreeRecord } =
  await import("../../harness/ops/core/symphony-state/worktree-record-schema.mjs");

const { ISSUE_TRANSITION_MAP, WORKTREE_TRANSITION_MAP } =
  await import("../../harness/ops/core/symphony-state/transition-map.mjs");
const { isValidIssueTransition } =
  await import("../../harness/ops/core/symphony-state/is-valid-issue-transition.mjs");
const { isValidWorktreeTransition } =
  await import("../../harness/ops/core/symphony-state/is-valid-worktree-transition.mjs");

const { inferExecutionPhase } =
  await import("../../harness/ops/core/symphony-state/infer-execution-phase.mjs");

// ---------------------------------------------------------------------------
// 1. ISSUE_PHASES enum
// ---------------------------------------------------------------------------

describe("ISSUE_PHASES", () => {
  it("should define all 12 expected phases", () => {
    const expected = [
      "eligible",
      "claimed",
      "executing",
      "cooldown",
      "blocked",
      "validation_failed",
      "commit_failed",
      "push_failed",
      "integration_pending",
      "evidence_pending",
      "integration_failed",
      "completed",
    ];
    for (const phase of expected) {
      expect(ISSUE_PHASES[phase]).toBe(phase);
    }
    expect(Object.keys(ISSUE_PHASES)).toHaveLength(12);
  });

  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(ISSUE_PHASES)).toBe(true);
  });

  it("should have VALID_ISSUE_PHASES set matching all enum values", () => {
    expect(VALID_ISSUE_PHASES.size).toBe(12);
    for (const value of Object.values(ISSUE_PHASES)) {
      expect(VALID_ISSUE_PHASES.has(value)).toBe(true);
    }
  });
});

describe("FINALIZATION_STATE_TO_PHASE", () => {
  it("should map all known finalization.state values to ISSUE_PHASES", () => {
    const mappings: Record<string, string> = {
      validation_failed_repairable: "validation_failed",
      commit_failed_repairable: "commit_failed",
      commit_failed_blocked: "commit_failed",
      branch_push_failed_repairable: "push_failed",
      integration_pending: "integration_pending",
      local_commit_complete: "integration_pending",
      evidence_pending_closeout: "evidence_pending",
      integration_failed_repairable: "integration_failed",
    };

    for (const [finState, expectedPhase] of Object.entries(mappings)) {
      expect(FINALIZATION_STATE_TO_PHASE[finState]).toBe(expectedPhase);
    }
  });

  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(FINALIZATION_STATE_TO_PHASE)).toBe(true);
  });

  it("should map to values that are valid ISSUE_PHASES", () => {
    const validSet = VALID_ISSUE_PHASES as Set<string>;
    for (const phase of Object.values(FINALIZATION_STATE_TO_PHASE)) {
      expect(validSet.has(phase as string)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. WORKTREE_STATES + normalizeWorktreeRecord
// ---------------------------------------------------------------------------

describe("WORKTREE_STATES", () => {
  it("should define all 6 expected states", () => {
    const expected = [
      "available",
      "executing",
      "dirty_owned",
      "dirty_orphaned",
      "quarantined",
      "blocked",
    ];
    for (const state of expected) {
      expect(WORKTREE_STATES[state]).toBe(state);
    }
    expect(Object.keys(WORKTREE_STATES)).toHaveLength(6);
  });

  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(WORKTREE_STATES)).toBe(true);
  });

  it("should have VALID_WORKTREE_STATES set matching all enum values", () => {
    expect(VALID_WORKTREE_STATES.size).toBe(6);
    for (const value of Object.values(WORKTREE_STATES)) {
      expect(VALID_WORKTREE_STATES.has(value)).toBe(true);
    }
  });
});

describe("normalizeWorktreeRecord", () => {
  it("should produce canonical shape from empty input", () => {
    const result = normalizeWorktreeRecord("wt1", {});
    expect(result).toEqual({
      worktreeId: "wt1",
      state: "available",
      assignedIssue: null,
      owner: null,
      leasedAt: null,
      quarantinedAt: null,
      reason: null,
      repairAttempts: 0,
      lastError: null,
      updatedAt: null,
    });
  });

  it("should accept old-style issueIdentifier and normalize to assignedIssue", () => {
    const result = normalizeWorktreeRecord("wt2", {
      state: "executing",
      issueIdentifier: "ANQ-100",
    });
    expect(result.assignedIssue).toBe("ANQ-100");
    expect(result.state).toBe("executing");
  });

  it("should prefer assignedIssue over issueIdentifier when both present", () => {
    const result = normalizeWorktreeRecord("wt3", {
      assignedIssue: "ANQ-200",
      issueIdentifier: "ANQ-100",
    });
    expect(result.assignedIssue).toBe("ANQ-200");
  });

  it("should preserve quarantine fields", () => {
    const result = normalizeWorktreeRecord("wt4", {
      state: "quarantined",
      quarantinedAt: "2026-04-15T00:00:00Z",
      reason: "diverged",
      repairAttempts: 3,
      lastError: "merge conflict",
    });
    expect(result.state).toBe("quarantined");
    expect(result.quarantinedAt).toBe("2026-04-15T00:00:00Z");
    expect(result.reason).toBe("diverged");
    expect(result.repairAttempts).toBe(3);
    expect(result.lastError).toBe("merge conflict");
  });

  it("should default invalid state to available", () => {
    const result = normalizeWorktreeRecord("wt5", {
      state: "nonexistent_state",
    });
    expect(result.state).toBe("available");
  });

  it("should coerce repairAttempts to number", () => {
    const result = normalizeWorktreeRecord("wt6", {
      repairAttempts: "5" as unknown,
    });
    expect(result.repairAttempts).toBe(5);
  });

  it("should handle undefined input", () => {
    const result = normalizeWorktreeRecord("wt7");
    expect(result.worktreeId).toBe("wt7");
    expect(result.state).toBe("available");
    expect(result.assignedIssue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Transition maps
// ---------------------------------------------------------------------------

describe("ISSUE_TRANSITION_MAP", () => {
  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(ISSUE_TRANSITION_MAP)).toBe(true);
  });

  it("should have an entry for every ISSUE_PHASE", () => {
    for (const phase of Object.values(ISSUE_PHASES)) {
      expect(ISSUE_TRANSITION_MAP[phase as string]).toBeDefined();
      expect(ISSUE_TRANSITION_MAP[phase as string]).toBeInstanceOf(Set);
    }
  });

  it("should allow eligible → claimed", () => {
    expect(isValidIssueTransition("eligible", "claimed")).toBe(true);
  });

  it("should allow claimed → executing", () => {
    expect(isValidIssueTransition("claimed", "executing")).toBe(true);
  });

  it("should allow executing → integration_pending", () => {
    expect(isValidIssueTransition("executing", "integration_pending")).toBe(true);
  });

  it("should allow integration_pending → evidence_pending", () => {
    expect(isValidIssueTransition("integration_pending", "evidence_pending")).toBe(true);
  });

  it("should allow evidence_pending → completed", () => {
    expect(isValidIssueTransition("evidence_pending", "completed")).toBe(true);
  });

  it("should allow completed → eligible (reopen)", () => {
    expect(isValidIssueTransition("completed", "eligible")).toBe(true);
  });

  it("should allow blocked → eligible (unblock)", () => {
    expect(isValidIssueTransition("blocked", "eligible")).toBe(true);
  });

  it("should allow executing → blocked", () => {
    expect(isValidIssueTransition("executing", "blocked")).toBe(true);
  });

  it("should allow validation_failed → executing (sticky repair)", () => {
    expect(isValidIssueTransition("validation_failed", "executing")).toBe(true);
  });

  it("should allow integration_failed → integration_pending (retry)", () => {
    expect(isValidIssueTransition("integration_failed", "integration_pending")).toBe(true);
  });

  it("should NOT allow eligible → completed (skip lifecycle)", () => {
    expect(isValidIssueTransition("eligible", "completed")).toBe(false);
  });

  it("should NOT allow completed → executing (skip claim)", () => {
    expect(isValidIssueTransition("completed", "executing")).toBe(false);
  });

  it("should NOT allow blocked → executing (must go through eligible)", () => {
    expect(isValidIssueTransition("blocked", "executing")).toBe(false);
  });

  it("should return false for unknown source phase", () => {
    expect(isValidIssueTransition("nonexistent", "eligible")).toBe(false);
  });
});

describe("WORKTREE_TRANSITION_MAP", () => {
  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(WORKTREE_TRANSITION_MAP)).toBe(true);
  });

  it("should have an entry for every WORKTREE_STATE", () => {
    for (const state of Object.values(WORKTREE_STATES)) {
      expect(WORKTREE_TRANSITION_MAP[state as string]).toBeDefined();
      expect(WORKTREE_TRANSITION_MAP[state as string]).toBeInstanceOf(Set);
    }
  });

  it("should allow available → executing", () => {
    expect(isValidWorktreeTransition("available", "executing")).toBe(true);
  });

  it("should allow executing → dirty_owned", () => {
    expect(isValidWorktreeTransition("executing", "dirty_owned")).toBe(true);
  });

  it("should allow executing → available (clean finish)", () => {
    expect(isValidWorktreeTransition("executing", "available")).toBe(true);
  });

  it("should allow dirty_owned → executing (sticky repair)", () => {
    expect(isValidWorktreeTransition("dirty_owned", "executing")).toBe(true);
  });

  it("should allow quarantined → available (cleared)", () => {
    expect(isValidWorktreeTransition("quarantined", "available")).toBe(true);
  });

  it("should allow dirty_orphaned → quarantined", () => {
    expect(isValidWorktreeTransition("dirty_orphaned", "quarantined")).toBe(true);
  });

  it("should NOT allow available → dirty_owned (must execute first)", () => {
    expect(isValidWorktreeTransition("available", "dirty_owned")).toBe(false);
  });

  it("should return false for unknown source state", () => {
    expect(isValidWorktreeTransition("nonexistent", "available")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. inferExecutionPhase
// ---------------------------------------------------------------------------

describe("inferExecutionPhase", () => {
  const now = Date.now();
  const futureExpiry = new Date(now + 600_000).toISOString();
  const pastExpiry = new Date(now - 600_000).toISOString();
  const futureCooldown = new Date(now + 300_000).toISOString();
  const pastCooldown = new Date(now - 300_000).toISOString();

  it("should return eligible for null/undefined record", () => {
    expect(inferExecutionPhase(null, now)).toBe("eligible");
    expect(inferExecutionPhase(undefined, now)).toBe("eligible");
  });

  it("should return eligible for empty record", () => {
    expect(inferExecutionPhase({}, now)).toBe("eligible");
  });

  it("should return claimed for active lease without run_id", () => {
    const record = {
      lease: {
        owner: "scheduler",
        run_id: null,
        expires_at: futureExpiry,
      },
    };
    expect(inferExecutionPhase(record, now)).toBe("claimed");
  });

  it("should return executing for active lease with run_id", () => {
    const record = {
      lease: {
        owner: "scheduler",
        run_id: "run-123",
        expires_at: futureExpiry,
      },
    };
    expect(inferExecutionPhase(record, now)).toBe("executing");
  });

  it("should return eligible for expired lease (no other state)", () => {
    const record = {
      lease: {
        owner: "scheduler",
        run_id: "run-123",
        expires_at: pastExpiry,
      },
    };
    expect(inferExecutionPhase(record, now)).toBe("eligible");
  });

  it("should return completed when completed_at is set", () => {
    const record = {
      completed_at: "2026-04-15T00:00:00Z",
    };
    expect(inferExecutionPhase(record, now)).toBe("completed");
  });

  it("should return blocked for human_only issues", () => {
    const record = { human_only: true };
    expect(inferExecutionPhase(record, now)).toBe("blocked");
  });

  it("should return blocked for retry_exhausted issues", () => {
    const record = { retry_exhausted: true };
    expect(inferExecutionPhase(record, now)).toBe("blocked");
  });

  it("should return blocked for issues with blocked_reason", () => {
    const record = { blocked_reason: "manual_hold" };
    expect(inferExecutionPhase(record, now)).toBe("blocked");
  });

  it("should return cooldown for active cooldown", () => {
    const record = { cooldown_until: futureCooldown };
    expect(inferExecutionPhase(record, now)).toBe("cooldown");
  });

  it("should return eligible for expired cooldown", () => {
    const record = { cooldown_until: pastCooldown };
    expect(inferExecutionPhase(record, now)).toBe("eligible");
  });

  // --- Finalization state mapping ---

  it("should return validation_failed for validation_failed_repairable", () => {
    const record = { finalization: { state: "validation_failed_repairable" } };
    expect(inferExecutionPhase(record, now)).toBe("validation_failed");
  });

  it("should return commit_failed for commit_failed_repairable", () => {
    const record = { finalization: { state: "commit_failed_repairable" } };
    expect(inferExecutionPhase(record, now)).toBe("commit_failed");
  });

  it("should return commit_failed for commit_failed_blocked", () => {
    const record = { finalization: { state: "commit_failed_blocked" } };
    expect(inferExecutionPhase(record, now)).toBe("commit_failed");
  });

  it("should return push_failed for branch_push_failed_repairable", () => {
    const record = { finalization: { state: "branch_push_failed_repairable" } };
    expect(inferExecutionPhase(record, now)).toBe("push_failed");
  });

  it("should return integration_pending for integration_pending finalization", () => {
    const record = { finalization: { state: "integration_pending" } };
    expect(inferExecutionPhase(record, now)).toBe("integration_pending");
  });

  it("should return integration_pending for local_commit_complete", () => {
    const record = { finalization: { state: "local_commit_complete" } };
    expect(inferExecutionPhase(record, now)).toBe("integration_pending");
  });

  it("should return evidence_pending for evidence_pending_closeout", () => {
    const record = { finalization: { state: "evidence_pending_closeout" } };
    expect(inferExecutionPhase(record, now)).toBe("evidence_pending");
  });

  it("should return integration_failed for integration_failed_repairable", () => {
    const record = { finalization: { state: "integration_failed_repairable" } };
    expect(inferExecutionPhase(record, now)).toBe("integration_failed");
  });

  it("should conservatively return integration_pending for unknown finalization state", () => {
    const record = { finalization: { state: "some_unknown_future_state" } };
    expect(inferExecutionPhase(record, now)).toBe("integration_pending");
  });

  // --- Priority order tests ---

  it("should prioritize active lease over completed_at", () => {
    const record = {
      lease: { owner: "scheduler", run_id: "run-1", expires_at: futureExpiry },
      completed_at: "2026-04-15T00:00:00Z",
    };
    expect(inferExecutionPhase(record, now)).toBe("executing");
  });

  it("should prioritize finalization over leftover active lease", () => {
    const record = {
      lease: { owner: "runner", run_id: "run-1", expires_at: futureExpiry },
      finalization: { state: "integration_pending" },
    };
    expect(inferExecutionPhase(record, now)).toBe("integration_pending");
  });

  it("should prioritize blocked over completed_at", () => {
    // Priority fix: blocked (priority 2) beats completed_at (priority 5)
    // because a blocked issue needs human attention regardless of
    // whether it previously completed.
    const record = {
      completed_at: "2026-04-15T00:00:00Z",
      human_only: true,
    };
    expect(inferExecutionPhase(record, now)).toBe("blocked");
  });

  it("should prioritize blocked over cooldown", () => {
    const record = {
      retry_exhausted: true,
      cooldown_until: futureCooldown,
    };
    expect(inferExecutionPhase(record, now)).toBe("blocked");
  });

  it("should prioritize cooldown over finalization", () => {
    const record = {
      cooldown_until: futureCooldown,
      finalization: { state: "integration_pending" },
    };
    expect(inferExecutionPhase(record, now)).toBe("cooldown");
  });

  it("should prioritize finalization over eligible default", () => {
    const record = {
      finalization: { state: "evidence_pending_closeout" },
    };
    expect(inferExecutionPhase(record, now)).toBe("evidence_pending");
  });

  it("should return eligible when finalization has no state", () => {
    const record = { finalization: {} };
    expect(inferExecutionPhase(record, now)).toBe("eligible");
  });

  it("should return eligible when finalization.state is null", () => {
    const record = { finalization: { state: null } };
    expect(inferExecutionPhase(record, now)).toBe("eligible");
  });
});
