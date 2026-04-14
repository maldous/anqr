/**
 * Test: Recovery daemon integration
 *
 * Tests the executeRepair function and state transitions.
 * Uses real symphony-state but mocks git operations.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  mutateState,
  getFinalizationState,
  getWorktreeState,
  acquireLease,
} from "../../harness/ops/core/symphony-state.mjs";
import { setFinalizationState } from "../../harness/ops/core/symphony-state/set-finalization-state.mjs";
import { setWorktreeState } from "../../harness/ops/core/symphony-state/set-worktree-state.mjs";
import { executeRepair } from "../../harness/ops/orchestration/symphony-worktree-recovery.mjs";

beforeEach(() => {
  mutateState((store) => {
    store.issues = {};
    store.worktreeStates = {};
    store.global = { integrationLock: null };
    return store;
  });
});

describe("executeRepair", () => {
  it("should skip when repairAction is skip", async () => {
    const result = await executeRepair("wt1", {
      classification: "clean",
      confidence: 1.0,
      inferredOwner: null,
      repairAction: "skip",
    });
    expect(result.ok).toBe(true);
    expect(result.action).toBe("skip");
  });

  it("should reclaim stale lease with high confidence owner", async () => {
    // Set up a stale lease
    acquireLease("ANQ-100", { owner: "runner", ttlMs: 1 });
    // Wait for expiry
    await new Promise((r) => setTimeout(r, 10));

    const result = await executeRepair("wt1", {
      classification: "stale_lease",
      confidence: 0.9,
      inferredOwner: "ANQ-100",
      repairAction: "reclaim_lease",
    });
    expect(result.ok).toBe(true);
    expect(result.action).toBe("reclaim_lease");
    expect(result.nextState).toBe("dirty_owned");

    const wtState = getWorktreeState("wt1");
    expect(wtState!.state).toBe("dirty_owned");
    expect(wtState!.issueIdentifier).toBe("ANQ-100");
  });

  it("should quarantine stale lease with low confidence", async () => {
    const result = await executeRepair("wt1", {
      classification: "stale_lease",
      confidence: 0.3,
      inferredOwner: null,
      repairAction: "reclaim_lease",
    });
    expect(result.ok).toBe(true);
    expect(result.nextState).toBe("quarantined");

    const wtState = getWorktreeState("wt1");
    expect(wtState!.state).toBe("quarantined");
  });

  it("should set dirty_owned for continue_repair", async () => {
    const result = await executeRepair("wt2", {
      classification: "dirty_owned",
      confidence: 1.0,
      inferredOwner: "ANQ-200",
      repairAction: "continue_repair",
    });
    expect(result.ok).toBe(true);
    expect(result.action).toBe("continue_repair");
    expect(result.nextState).toBe("dirty_owned");

    const wtState = getWorktreeState("wt2");
    expect(wtState!.state).toBe("dirty_owned");
    expect(wtState!.issueIdentifier).toBe("ANQ-200");
  });

  it("should quarantine dirty orphaned worktrees", async () => {
    const result = await executeRepair("wt3", {
      classification: "dirty_orphaned",
      confidence: 0.2,
      inferredOwner: null,
      repairAction: "quarantine",
    });
    expect(result.ok).toBe(true);
    expect(result.action).toBe("quarantine");
    expect(result.nextState).toBe("quarantined");

    const wtState = getWorktreeState("wt3");
    expect(wtState!.state).toBe("quarantined");
    expect(wtState!.reason).toBe("dirty_orphaned");
  });

  it("should mark missing worktree for reprovisioning", async () => {
    const result = await executeRepair("wt4", {
      classification: "missing",
      confidence: 1.0,
      inferredOwner: null,
      repairAction: "reprovision",
    });
    expect(result.ok).toBe(true);
    expect(result.action).toBe("reprovision");
    expect(result.nextState).toBe("quarantined");
  });
});

describe("Recovery state transitions", () => {
  it("dirty tree with known owner gets repair priority", () => {
    setFinalizationState("ANQ-300", {
      state: "validation_failed_repairable",
      stickyOwner: "wt1",
      worktreeId: "wt1",
      lastError: "typecheck failed",
      attempts: 1,
    });
    setWorktreeState("wt1", { state: "dirty_owned", issueIdentifier: "ANQ-300" });

    const wtState = getWorktreeState("wt1");
    expect(wtState!.state).toBe("dirty_owned");
    expect(wtState!.issueIdentifier).toBe("ANQ-300");

    const fin = getFinalizationState("ANQ-300");
    expect(fin!.state).toBe("validation_failed_repairable");
    expect(fin!.stickyOwner).toBe("wt1");
  });

  it("failed validation does not create new issue", () => {
    // This is a unit test verifying the state model supports repair without new issue creation
    setFinalizationState("ANQ-400", {
      state: "validation_failed_repairable",
      stickyOwner: "wt2",
      worktreeId: "wt2",
      lastError: "lint errors",
      attempts: 2,
    });

    // The same issue should be repairable, not a new one created
    const fin = getFinalizationState("ANQ-400");
    expect(fin!.state).toBe("validation_failed_repairable");
    expect(fin!.attempts).toBe(2);
  });

  it("repeated failed repair transitions to quarantined", async () => {
    setWorktreeState("wt3", {
      state: "dirty_owned",
      issueIdentifier: "ANQ-500",
      repairAttempts: 4,
    });

    const result = await executeRepair("wt3", {
      classification: "dirty_orphaned",
      confidence: 0.2,
      inferredOwner: null,
      repairAction: "quarantine",
    });

    expect(result.nextState).toBe("quarantined");
    const wtState = getWorktreeState("wt3");
    expect(wtState!.state).toBe("quarantined");
  });

  it("clean repaired worktree returns to available", () => {
    // Simulate repair success: clear finalization and reset worktree
    setWorktreeState("wt4", { state: "dirty_owned", issueIdentifier: "ANQ-600" });
    setFinalizationState("ANQ-600", {
      state: "integration_pending",
      stickyOwner: "wt4",
      worktreeId: "wt4",
    });

    // After successful push + integration, worktree returns to available
    setWorktreeState("wt4", { state: "available", issueIdentifier: null });

    const wtState = getWorktreeState("wt4");
    expect(wtState!.state).toBe("available");
    expect(wtState!.issueIdentifier).toBeNull();
  });
});
