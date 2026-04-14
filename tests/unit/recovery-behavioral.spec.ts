import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Behavioral recovery tests — ADR-0005 + ADR-0006.
 *
 * These tests exercise the REAL executeRepair function with mocked external
 * dependencies, proving runtime behavior rather than source structure.
 *
 * Proves:
 * 1. Quarantine action emits correct evidence and calls recordQuarantine
 * 2. retry_push is demoted to quarantine at runtime
 * 3. auto_commit_and_push is demoted to quarantine at runtime
 * 4. reset_to_main is blocked when lease is active
 * 5. skip action returns unchanged state with evidence
 * 6. Evidence fields are present and correctly classified in all paths
 */

// ---------------------------------------------------------------------------
// Mock all external dependencies of execute-repair.mjs
// ---------------------------------------------------------------------------

const mockTransitionWorktree = vi.fn();
const mockGetWorktreeState = vi.fn().mockReturnValue(null);
const mockRecordQuarantine = vi.fn();
const mockReleaseLease = vi.fn();
const mockLeaseIsActive = vi.fn().mockReturnValue(false);

vi.mock("../../harness/ops/symphony-state.mjs", () => ({
  transitionWorktree: (...args: unknown[]) => mockTransitionWorktree(...args),
  getWorktreeState: (...args: unknown[]) => mockGetWorktreeState(...args),
  recordQuarantine: (...args: unknown[]) => mockRecordQuarantine(...args),
  releaseLease: (...args: unknown[]) => mockReleaseLease(...args),
  leaseIsActive: (...args: unknown[]) => mockLeaseIsActive(...args),
}));

vi.mock("../../harness/ops/symphony-config.mjs", () => ({
  RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD: 0.7,
}));

vi.mock("../../harness/ops/core/worktree-config.mjs", () => ({
  getWorktreePath: (id: string) => `/tmp/test-worktrees/wt${id}`,
  PROJECT_ROOT: "/tmp/test-project",
}));

vi.mock("node:child_process", () => {
  const execFileSync = vi.fn();
  return { default: { execFileSync }, execFileSync };
});

vi.mock("../../harness/ops/integrations/notifications/openclaw-discord.mjs", () => ({
  sendDiscordEmbed: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../harness/ops/orchestration/symphony-worktree-recovery/logger.mjs", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Evidence validation helper
// ---------------------------------------------------------------------------

interface Evidence {
  actionClass: string;
  target: string;
  reason: string;
  ownershipBasis: string | null;
  isStateOnly: boolean;
  isNonPublishing: boolean;
  timestamp: string;
}

function assertValidEvidence(evidence: Evidence, expected: Partial<Evidence>) {
  // All evidence must have the required ADR-0006 fields
  expect(evidence.actionClass).toBeDefined();
  expect(evidence.target).toBeDefined();
  expect(evidence.reason).toBeDefined();
  expect(typeof evidence.isStateOnly).toBe("boolean");
  expect(typeof evidence.isNonPublishing).toBe("boolean");
  expect(evidence.timestamp).toBeDefined();
  // All recovery actions must be non-publishing per ADR-0005
  expect(evidence.isNonPublishing).toBe(true);
  // Check specific expected values
  for (const [key, value] of Object.entries(expected)) {
    expect(evidence[key as keyof Evidence]).toBe(value);
  }
}

// ---------------------------------------------------------------------------
// Behavioral tests
// ---------------------------------------------------------------------------

describe("Recovery executeRepair behavioral tests — ADR-0005 + ADR-0006", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWorktreeState.mockReturnValue(null);
    mockLeaseIsActive.mockReturnValue(false);
  });

  it("skip action: returns unchanged state with state-only evidence", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const result = await executeRepair("wt1", {
      repairAction: "skip",
      inferredOwner: null,
      classification: "clean",
      confidence: 1.0,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("skip");
    expect(result.nextState).toBe("unchanged");
    assertValidEvidence(result.evidence, {
      actionClass: "skip",
      target: "wt1",
      isStateOnly: true,
    });
    // skip must not call any state-mutation functions
    expect(mockTransitionWorktree).not.toHaveBeenCalled();
    expect(mockRecordQuarantine).not.toHaveBeenCalled();
  });

  it("quarantine action: records quarantine with evidence", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const result = await executeRepair("wt2", {
      repairAction: "quarantine",
      inferredOwner: "ANQ-500",
      classification: "dirty_orphaned",
      confidence: 0.3,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("quarantine");
    expect(result.nextState).toBe("quarantined");
    assertValidEvidence(result.evidence, {
      actionClass: "quarantine",
      target: "wt2",
      isStateOnly: true,
    });
    expect(mockRecordQuarantine).toHaveBeenCalledWith(
      "wt2",
      expect.objectContaining({
        reason: "dirty_orphaned",
      }),
    );
  });

  it("retry_push: demoted to quarantine at runtime — no git push executed", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const { execFileSync } = await import("node:child_process");

    const result = await executeRepair("wt3", {
      repairAction: "retry_push",
      inferredOwner: "ANQ-600",
      classification: "push_failed",
      confidence: 0.8,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("quarantine"); // demoted
    expect(result.nextState).toBe("quarantined");
    assertValidEvidence(result.evidence, {
      actionClass: "demotion",
      target: "wt3",
      reason: "retry_push_demoted_to_quarantine",
      isStateOnly: true, // demotion → quarantine is state-only
    });
    // Critical: no git commands must have been executed
    expect(execFileSync).not.toHaveBeenCalled();
    // Must have called recordQuarantine (the delegated action)
    expect(mockRecordQuarantine).toHaveBeenCalledWith("wt3", expect.anything());
  });

  it("auto_commit_and_push: demoted to quarantine at runtime — no git commands", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const { execFileSync } = await import("node:child_process");

    const result = await executeRepair("wt4", {
      repairAction: "auto_commit_and_push",
      inferredOwner: null,
      classification: "dirty_orphaned",
      confidence: 0.2,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("quarantine"); // demoted
    expect(result.nextState).toBe("quarantined");
    assertValidEvidence(result.evidence, {
      actionClass: "demotion",
      target: "wt4",
      reason: "auto_commit_and_push_demoted_to_quarantine",
    });
    // No git commands
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it("reset_to_main: blocked when worktree has active lease — falls back to quarantine", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const { execFileSync } = await import("node:child_process");

    // Set up active lease
    mockGetWorktreeState.mockReturnValue({
      state: "executing",
      lease: { expires_at: new Date(Date.now() + 600_000).toISOString() },
    });
    mockLeaseIsActive.mockReturnValue(true);

    const result = await executeRepair("wt1", {
      repairAction: "reset_to_main",
      inferredOwner: null,
      classification: "diverged",
      confidence: 0.9,
    });

    expect(result.ok).toBe(true);
    // Must have been redirected to quarantine because of active lease
    expect(result.action).toBe("quarantine");
    expect(result.nextState).toBe("quarantined");
    // No git reset/clean must have been attempted
    expect(execFileSync).not.toHaveBeenCalled();
    // Must have called recordQuarantine
    expect(mockRecordQuarantine).toHaveBeenCalled();
  });

  it("reset_to_main: executes sandbox reset when no active lease", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const { execFileSync } = await import("node:child_process");

    // No active lease
    mockGetWorktreeState.mockReturnValue(null);
    mockLeaseIsActive.mockReturnValue(false);

    const result = await executeRepair("wt2", {
      repairAction: "reset_to_main",
      inferredOwner: null,
      classification: "diverged",
      confidence: 0.9,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("reset_to_main");
    expect(result.nextState).toBe("available");
    assertValidEvidence(result.evidence, {
      actionClass: "sandbox_reset",
      target: "wt2",
      isStateOnly: false, // sandbox_reset is NOT state-only (it does git operations)
      isNonPublishing: true, // but it IS non-publishing (no commit/push)
    });
    // Must have called git fetch, reset, clean (sandbox maintenance)
    expect(execFileSync).toHaveBeenCalledWith(
      "git",
      expect.arrayContaining(["fetch"]),
      expect.anything(),
    );
    expect(execFileSync).toHaveBeenCalledWith(
      "git",
      expect.arrayContaining(["reset"]),
      expect.anything(),
    );
    expect(execFileSync).toHaveBeenCalledWith(
      "git",
      expect.arrayContaining(["clean"]),
      expect.anything(),
    );
    // Must NOT have called git add, commit, or push
    const allCalls = vi.mocked(execFileSync).mock.calls;
    for (const call of allCalls) {
      const args = call[1] as string[];
      expect(args[0]).not.toBe("add");
      expect(args[0]).not.toBe("commit");
      expect(args[0]).not.toBe("push");
    }
    // Must have set worktree state to available
    expect(mockTransitionWorktree).toHaveBeenCalledWith("wt2", "available", {
      assignedIssue: null,
    });
  });

  it("reprovision action: quarantines with missing reason", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const result = await executeRepair("wt4", {
      repairAction: "reprovision",
      inferredOwner: null,
      classification: "missing",
      confidence: 1.0,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("reprovision");
    expect(result.nextState).toBe("quarantined");
    assertValidEvidence(result.evidence, {
      actionClass: "reprovision",
      target: "wt4",
      isStateOnly: true,
    });
    expect(mockRecordQuarantine).toHaveBeenCalledWith(
      "wt4",
      expect.objectContaining({
        reason: "missing",
      }),
    );
  });

  it("continue_repair: sets worktree state with evidence", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const result = await executeRepair("wt1", {
      repairAction: "continue_repair",
      inferredOwner: "ANQ-800",
      classification: "dirty_owned",
      confidence: 0.9,
    });

    expect(result.ok).toBe(true);
    expect(result.action).toBe("continue_repair");
    expect(result.nextState).toBe("dirty_owned");
    assertValidEvidence(result.evidence, {
      actionClass: "continue_repair",
      target: "wt1",
      ownershipBasis: "ANQ-800",
      isStateOnly: true,
    });
    expect(mockTransitionWorktree).toHaveBeenCalledWith("wt1", "dirty_owned", {
      assignedIssue: "ANQ-800",
    });
  });

  it("unknown action: returns error with evidence", async () => {
    const { executeRepair } =
      await import("../../harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs");
    const result = await executeRepair("wt1", {
      repairAction: "nonexistent_action",
      inferredOwner: null,
      classification: "unknown",
      confidence: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("unknown action");
    expect(result.evidence).toBeDefined();
    expect(result.evidence.actionClass).toBe("skip");
  });
});
