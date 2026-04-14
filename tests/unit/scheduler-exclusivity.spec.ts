import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "node:fs";

/**
 * Scheduler exclusivity tests — ADR-0002.
 *
 * Proves:
 * 1. claimIssue() atomically acquires a lease (real module, mocked fs layer)
 * 2. Duplicate claims for the same issue are rejected
 * 3. Blocked / exhausted / cooldown issues cannot be claimed
 * 4. Desired-work queue is consumed by scheduler (not just written)
 * 5. Router always verifies scheduler claims (no bypass path)
 * 6. Scheduler assigns worktreeId at claim time, preventing double-assignment
 * 7. Runner does not self-pick global work
 * 8. Webhook receiver always enqueues (no direct dispatch)
 * 9. Reconciler always feeds desired-work queue (no direct dispatch)
 */

// ---------------------------------------------------------------------------
// Mock filesystem layer so we can exercise real claimIssue
// ---------------------------------------------------------------------------

let mockState: Record<string, unknown> = {
  version: 1,
  updatedAt: "",
  hostId: "test",
  global: { integrationLock: null },
  issues: {},
  worktreeStates: {},
};
let mockLockHeld = false;

vi.mock("../../harness/ops/core/symphony-state/load-state.mjs", () => ({
  loadState: () => JSON.parse(JSON.stringify(mockState)),
}));

vi.mock("../../harness/ops/core/symphony-state/save-state.mjs", () => ({
  saveState: (store: unknown) => {
    mockState = JSON.parse(JSON.stringify(store));
  },
}));

vi.mock("../../harness/ops/core/symphony-state/with-state-lock.mjs", () => ({
  withStateLock: <T>(fn: () => T): T => {
    if (mockLockHeld) throw new Error("Lock contention");
    mockLockHeld = true;
    try {
      return fn();
    } finally {
      mockLockHeld = false;
    }
  },
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
// Tests exercising REAL claimIssue module
// ---------------------------------------------------------------------------

describe("Scheduler exclusivity — ADR-0002 (real claimIssue module)", () => {
  beforeEach(() => {
    mockState = {
      version: 1,
      updatedAt: "",
      hostId: "test",
      global: { integrationLock: null },
      issues: {},
      worktreeStates: {},
    };
    mockLockHeld = false;
  });

  it("should claim an unclaimed issue successfully", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const result = claimIssue("ANQ-100", { worktreeId: "wt1" });
    expect(result.ok).toBe(true);
    expect(result.lease).toBeDefined();
    expect(result.lease.owner).toBe("scheduler");
    expect(result.lease.nonce).toContain("scheduler-test-host-");
    expect(result.assignment).toBeDefined();
    expect(result.assignment.worktreeId).toBe("wt1");
    expect(result.assignment.claimedBy).toBe("scheduler");
  });

  it("should reject duplicate claim for already-claimed issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const first = claimIssue("ANQ-200", { worktreeId: "wt1" });
    expect(first.ok).toBe(true);

    const second = claimIssue("ANQ-200", { worktreeId: "wt2" });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("already_claimed");
  });

  it("should reject claim for human-only issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    (mockState as Record<string, unknown>).issues = {
      "ANQ-300": { issueIdentifier: "ANQ-300", human_only: true },
    };
    const result = claimIssue("ANQ-300", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("human_only");
  });

  it("should reject claim for retry-exhausted issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    (mockState as Record<string, unknown>).issues = {
      "ANQ-400": { issueIdentifier: "ANQ-400", retry_exhausted: true },
    };
    const result = claimIssue("ANQ-400", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("retry_exhausted");
  });

  it("should reject claim for blocked issue", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    (mockState as Record<string, unknown>).issues = {
      "ANQ-500": { issueIdentifier: "ANQ-500", blocked_reason: "manual_block" },
    };
    const result = claimIssue("ANQ-500", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("blocked");
  });

  it("should reject claim for issue on cooldown", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const future = new Date(Date.now() + 600_000).toISOString();
    (mockState as Record<string, unknown>).issues = {
      "ANQ-600": { issueIdentifier: "ANQ-600", cooldown_until: future },
    };
    const result = claimIssue("ANQ-600", { worktreeId: "wt1" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("cooldown_active");
  });

  it("should allow claim after lease expires", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    // First claim
    claimIssue("ANQ-700", { worktreeId: "wt1" });

    // Manually expire the lease in mock state
    const issues = (mockState as Record<string, Record<string, unknown>>).issues;
    const record = issues["ANQ-700"] as Record<string, unknown>;
    (record.lease as Record<string, string>).expires_at = new Date(Date.now() - 1000).toISOString();

    const second = claimIssue("ANQ-700", { worktreeId: "wt3" });
    expect(second.ok).toBe(true);
    expect(second.assignment.worktreeId).toBe("wt3");
  });

  it("should allow claiming multiple different issues", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    expect(claimIssue("ANQ-801", { worktreeId: "wt1" }).ok).toBe(true);
    expect(claimIssue("ANQ-802", { worktreeId: "wt2" }).ok).toBe(true);
    expect(claimIssue("ANQ-803", { worktreeId: "wt3" }).ok).toBe(true);
  });

  it("should persist claim in state store after successful claim", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    claimIssue("ANQ-900", { worktreeId: "wt2", source: "scheduler" });

    const issues = (mockState as Record<string, Record<string, unknown>>).issues;
    const persisted = issues["ANQ-900"] as Record<string, unknown>;
    expect(persisted).toBeDefined();
    expect(persisted.lease).toBeDefined();
    expect(persisted.assignment).toBeDefined();
    expect((persisted.assignment as Record<string, unknown>).worktreeId).toBe("wt2");
  });

  it("should create claim state that satisfies router verification contract", async () => {
    // ADR-0002 behavioral integration: the claim state created by claimIssue
    // must satisfy verifySchedulerClaim's three checks:
    // 1. Active lease exists
    // 2. lease.owner === "scheduler"
    // 3. assignment.worktreeId is set
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    const result = claimIssue("ANQ-1000", { worktreeId: "wt3", source: "scheduler" });
    expect(result.ok).toBe(true);

    // Read the persisted state and verify the router contract
    const issues = (mockState as Record<string, Record<string, unknown>>).issues;
    const state = issues["ANQ-1000"] as Record<string, unknown>;

    // 1. Active lease exists (expires_at is in the future)
    const lease = state.lease as Record<string, string>;
    expect(lease).toBeDefined();
    expect(new Date(lease.expires_at).getTime()).toBeGreaterThan(Date.now());

    // 2. Lease owner is "scheduler" — router checks this explicitly
    expect(lease.owner).toBe("scheduler");

    // 3. Assignment metadata with worktreeId — router reads this for dispatch
    const assignment = state.assignment as Record<string, unknown>;
    expect(assignment).toBeDefined();
    expect(assignment.worktreeId).toBe("wt3");
    expect(assignment.claimedBy).toBe("scheduler");
    expect(assignment.source).toBe("scheduler");
  });

  it("should reject claim when worktreeId is missing", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");
    // @ts-expect-error — intentionally testing runtime rejection of missing worktreeId
    const result = claimIssue("ANQ-1100", { worktreeId: undefined, source: "scheduler" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("missing_worktree_assignment");
  });
});

describe("Multi-issue claim with worktree assignment — ADR-0002 integration", () => {
  beforeEach(() => {
    mockState = {
      version: 1,
      updatedAt: "",
      hostId: "test",
      global: { integrationLock: null },
      issues: {},
      worktreeStates: {},
    };
    mockLockHeld = false;
  });

  it("should assign different worktrees to different issues", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");

    // Simulate scheduler assigning from available pool: wt1, wt2, wt3, wt4
    const worktreePool = ["wt1", "wt2", "wt3", "wt4"];
    const assignedThisCycle = new Set<string>();
    const claims: Array<{ identifier: string; worktreeId: string }> = [];

    const issues = ["ANQ-2001", "ANQ-2002", "ANQ-2003"];
    for (const issueId of issues) {
      const worktreeId = worktreePool.find((wt) => !assignedThisCycle.has(wt));
      if (!worktreeId) throw new Error("Test error: pool unexpectedly exhausted");
      const result = claimIssue(issueId, { worktreeId, source: "scheduler" });
      expect(result.ok).toBe(true);
      assignedThisCycle.add(worktreeId);
      claims.push({ identifier: issueId, worktreeId });
    }

    // Each claim should have a unique worktree
    const assignedWorktrees = claims.map((c) => c.worktreeId);
    expect(new Set(assignedWorktrees).size).toBe(assignedWorktrees.length);
    expect(assignedWorktrees).toEqual(["wt1", "wt2", "wt3"]);

    // All claims should satisfy the router contract independently
    const stateIssues = (mockState as Record<string, Record<string, unknown>>).issues;
    for (const claim of claims) {
      const persisted = stateIssues[claim.identifier] as Record<string, unknown>;
      const lease = persisted.lease as Record<string, string>;
      const assignment = persisted.assignment as Record<string, unknown>;

      expect(lease.owner).toBe("scheduler");
      expect(new Date(lease.expires_at).getTime()).toBeGreaterThan(Date.now());
      expect(assignment.worktreeId).toBe(claim.worktreeId);
    }
  });

  it("should reject claim when same-cycle assignment pool is exhausted", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");

    // Simulate scheduler with only 2 available worktrees and 3 issues
    const worktreePool = ["wt1", "wt2"];
    const assignedThisCycle = new Set<string>();
    const results: Array<{ ok: boolean; worktreeId: string | null; reason?: string }> = [];

    for (const issueId of ["ANQ-3001", "ANQ-3002", "ANQ-3003"]) {
      const worktreeId = worktreePool.find((wt) => !assignedThisCycle.has(wt)) ?? null;
      const result = claimIssue(issueId, {
        // @ts-expect-error — pool exhaustion intentionally passes undefined to test rejection
        worktreeId: worktreeId ?? undefined,
        source: "scheduler",
      });
      if (result.ok && worktreeId) {
        assignedThisCycle.add(worktreeId);
      }
      results.push({ ok: result.ok, worktreeId, reason: result.reason });
    }

    // First two get unique worktrees and succeed
    expect(results[0].worktreeId).toBe("wt1");
    expect(results[0].ok).toBe(true);
    expect(results[1].worktreeId).toBe("wt2");
    expect(results[1].ok).toBe(true);

    // Third has no available worktree and must be rejected rather than claimed
    expect(results[2].worktreeId).toBeNull();
    expect(results[2].ok).toBe(false);
    expect(results[2].reason).toBe("missing_worktree_assignment");
  });

  it("should reject claim for already-claimed issue even with different worktree", async () => {
    const { claimIssue } = await import("../../harness/ops/core/symphony-state/claim-issue.mjs");

    const first = claimIssue("ANQ-4001", { worktreeId: "wt1" });
    expect(first.ok).toBe(true);

    // Different worktree, same issue — must be rejected
    const second = claimIssue("ANQ-4001", { worktreeId: "wt2" });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("already_claimed");
  });
});

describe("Desired-work queue consumption — ADR-0002", () => {
  it("should verify scheduler drains the desired-work queue (source code proof)", () => {
    const source = fs.readFileSync(
      "harness/ops/orchestration/symphony-scheduler/get-eligible-work.mjs",
      "utf-8",
    );
    // Scheduler must import and call drainDesiredWork
    expect(source).toContain("drainDesiredWork");
    expect(source).toContain("import");
    // Must use the drained identifiers for priority boosting
    expect(source).toContain("desiredWork.identifiers");
  });

  it("should verify drainDesiredWork module uses dequeue (not just peek)", () => {
    const source = fs.readFileSync(
      "harness/ops/orchestration/symphony-scheduler/drain-desired-work.mjs",
      "utf-8",
    );
    // Must consume (dequeue), not just read (peek/items)
    expect(source).toContain(".dequeue()");
    expect(source).not.toMatch(/\.items\(\)/);
    expect(source).not.toMatch(/\.peek\(\)/);
  });

  it("should verify desired-work queue name matches between producers and consumer", () => {
    const scheduler = fs.readFileSync(
      "harness/ops/orchestration/symphony-scheduler/drain-desired-work.mjs",
      "utf-8",
    );
    const webhook = fs.readFileSync(
      "harness/ops/integrations/model/linear-webhook-receiver/trigger-issue-execution.mjs",
      "utf-8",
    );
    const reconciler = fs.readFileSync(
      "harness/ops/orchestration/linear-reconciler/run-reconciliation-cycle/run-reconciliation-cycle.mjs",
      "utf-8",
    );
    // All three must use the same queue name
    expect(scheduler).toContain('"symphony-desired-work"');
    expect(webhook).toContain('"symphony-desired-work"');
    expect(reconciler).toContain('"symphony-desired-work"');
  });
});

describe("Router claim verification — ADR-0002 (always enforced)", () => {
  it("should verify trigger path verifies scheduler claims", () => {
    const source = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/handle-linear-trigger.mjs",
      "utf-8",
    );
    // Trigger path must import and call verifySchedulerClaim from shared module
    expect(source).toContain("verifySchedulerClaim");
    expect(source).toContain("import { verifySchedulerClaim }");
    expect(source).toContain("./verify-scheduler-claim.mjs");
    // There must be NO bypass path
    expect(source).not.toContain("SCHEDULER_AUTHORITATIVE");
  });

  it("should verify shared verifySchedulerClaim module checks all three conditions", () => {
    const source = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/verify-scheduler-claim.mjs",
      "utf-8",
    );
    // Must import claim-checking state functions
    expect(source).toContain("leaseIsActive");
    expect(source).toContain("getIssueState");
    // Must check lease.owner === "scheduler"
    expect(source).toContain('.owner !== "scheduler"');
    expect(source).toContain('"not_scheduler_owned"');
    // Must check durable assignment with worktreeId
    expect(source).toContain("assignment.worktreeId");
    expect(source).toContain('"no_worktree_assignment"');
    // Must check active lease
    expect(source).toContain('"no_active_claim"');
  });

  it("should verify router queue drain also verifies scheduler claims (no bypass)", () => {
    const source = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/runtime.mjs",
      "utf-8",
    );
    // Queue drain must import and call verifySchedulerClaim
    expect(source).toContain("verifySchedulerClaim");
    expect(source).toContain("import { verifySchedulerClaim }");
    expect(source).toContain("./verify-scheduler-claim.mjs");
    // Must check claim validity before dispatch
    expect(source).toContain("claimCheck.allowed");
    // Must drop items with invalid claims (not dispatch blindly)
    expect(source).toContain("claimCheck.reason");
    expect(source).toContain("continue");
    // Must resolve assigned worktree from claim, not self-select
    expect(source).toContain("claimCheck.assignedWorktreeId");
  });

  it("should verify queue drain does NOT call dispatchLinearExecution without claim verification", () => {
    const source = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/runtime.mjs",
      "utf-8",
    );
    // The old bypass pattern — bare dispatchLinearExecution(item.identifier) — must not exist
    expect(source).not.toMatch(/dispatchLinearExecution\(item\.identifier\)\s*;/);
    // Every dispatch must go through claim verification first
    const verifyIndex = source.indexOf("verifySchedulerClaim(item.identifier)");
    const dispatchIndex = source.indexOf("dispatchLinearExecution(item.identifier");
    expect(verifyIndex).toBeGreaterThan(-1);
    expect(dispatchIndex).toBeGreaterThan(verifyIndex);
  });

  it("should verify router rejects unclaimed dispatch with 409", () => {
    const triggerSource = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/handle-linear-trigger.mjs",
      "utf-8",
    );
    // Trigger path must return 409 when claim check fails
    expect(triggerSource).toContain("409");
    // Reason codes live in the shared verifySchedulerClaim module
    const claimSource = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/verify-scheduler-claim.mjs",
      "utf-8",
    );
    expect(claimSource).toContain("no_active_claim");
  });

  it("should verify router uses scheduler-assigned worktree", () => {
    const source = fs.readFileSync(
      "harness/ops/integrations/model/symphony-agent-router/handle-linear-trigger.mjs",
      "utf-8",
    );
    expect(source).toContain("import { WORKTREES }");
    expect(source).toContain("claimCheck.assignedWorktreeId");
    expect(source).toContain("WORKTREES.find");
  });
});

describe("Scheduler worktree assignment at claim time — ADR-0002", () => {
  it("should verify scheduler selects worktreeId from capacity data", () => {
    const source = fs.readFileSync(
      "harness/ops/orchestration/symphony-scheduler/schedule-cycle.mjs",
      "utf-8",
    );
    // Must derive available worktrees from capacity
    expect(source).toContain("capacity.worktrees");
    expect(source).toContain("healthy");
    expect(source).toContain("executing");
    // Must pass worktreeId into claimIssue
    expect(source).toContain("worktreeId");
    expect(source).toContain("claimIssue(issue.identifier");
  });

  it("should verify scheduler tracks assignments within a cycle to avoid double-assignment", () => {
    const source = fs.readFileSync(
      "harness/ops/orchestration/symphony-scheduler/schedule-cycle.mjs",
      "utf-8",
    );
    // Must track which worktrees have been assigned this cycle
    expect(source).toContain("assignedThisCycle");
    expect(source).toContain(".add(");
    expect(source).toContain(".has(");
  });

  it("should verify scheduler stops dispatch when no worktree available (no null-assignment claims)", () => {
    const source = fs.readFileSync(
      "harness/ops/orchestration/symphony-scheduler/schedule-cycle.mjs",
      "utf-8",
    );
    // When pool is exhausted, scheduler must break — not claim with null worktreeId
    expect(source).toContain("if (!worktreeId)");
    expect(source).toContain("break");
    // The break must come before claimIssue — scheduler must not claim without assignment
    const noWorktreeGuard = source.indexOf("if (!worktreeId)");
    const claimCall = source.indexOf("claimIssue(issue.identifier", noWorktreeGuard);
    const breakStmt = source.indexOf("break", noWorktreeGuard);
    expect(breakStmt).toBeLessThan(claimCall);
  });
});

describe("Systemd topology — ADR-0002", () => {
  it("should verify scheduler service is enabled in default.target.wants", () => {
    const service = fs.readFileSync("services/systemd/anqr-symphony-scheduler.service", "utf-8");
    const enabledUnit = fs.readFileSync(
      "services/systemd/default.target.wants/anqr-symphony-scheduler.service",
      "utf-8",
    );
    expect(service).toContain(
      "ExecStart=/usr/bin/node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon",
    );
    expect(enabledUnit).toContain(
      "ExecStart=/usr/bin/node harness/ops/orchestration/symphony-scheduler/runtime.mjs --daemon",
    );
  });
});

describe("Legacy path removal verification — ADR-0002 completion", () => {
  it("runner should not self-pick global work", () => {
    const source = fs.readFileSync("harness/ops/orchestration/symphony-runner/main.mjs", "utf-8");
    // Runner must not import SCHEDULER_AUTHORITATIVE (no toggle)
    expect(source).not.toContain("SCHEDULER_AUTHORITATIVE");
    // Runner must not import pickIssue (no self-pick)
    expect(source).not.toContain("pickIssue");
  });

  it("webhook receiver should always enqueue, never dispatch directly", () => {
    const source = fs.readFileSync(
      "harness/ops/integrations/model/linear-webhook-receiver/trigger-issue-execution.mjs",
      "utf-8",
    );
    // Must not contain legacy triggerViaRouter
    expect(source).not.toContain("triggerViaRouter");
    // Must not import SCHEDULER_AUTHORITATIVE
    expect(source).not.toContain("SCHEDULER_AUTHORITATIVE");
    // Must always enqueue to desired-work
    expect(source).toContain("enqueueDesiredWork");
    expect(source).toContain('"symphony-desired-work"');
  });

  it("reconciler should always feed desired-work queue, never dispatch directly", () => {
    const source = fs.readFileSync(
      "harness/ops/orchestration/linear-reconciler/run-reconciliation-cycle/run-reconciliation-cycle.mjs",
      "utf-8",
    );
    // Must not import SCHEDULER_AUTHORITATIVE
    expect(source).not.toContain("SCHEDULER_AUTHORITATIVE");
    // Must not import dispatchIssue
    expect(source).not.toContain("dispatchIssue");
    // Must use feedDesiredWorkQueue
    expect(source).toContain("feedDesiredWorkQueue");
  });
});
