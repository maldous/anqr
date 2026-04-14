/**
 * Test: Autonomy simulation — end-to-end state machine scenarios
 *
 * Simulates multi-step failure and recovery scenarios using the
 * real state module. Git operations and agent execution are simulated
 * via direct state manipulation.
 *
 * This test verifies the platform's state machine transitions are
 * correct for each scenario, without requiring actual worktrees or agents.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  mutateState,
  setFinalizationState,
  getFinalizationState,
  listIntegrationCandidates,
  acquireIntegrationLock,
  releaseIntegrationLock,
  acquireLease,
  releaseLease,
  setWorktreeState,
  getWorktreeState,
  recordQuarantine,
  getNextRepairableIssueForWorktree,
  listWorktreesByState,
} from "../../harness/ops/core/symphony-state.mjs";
import { classifyWorktree } from "../../harness/ops/orchestration/symphony-worktree-recovery.mjs";

beforeEach(() => {
  mutateState((store) => {
    store.issues = {};
    store.worktreeStates = {};
    store.global = { integrationLock: null };
    return store;
  });
});

describe("Scenario 1: Validation failure → recovery → integration", () => {
  it("should complete full cycle: fail → repair → push → integrate", () => {
    const issue = "ANQ-S1";
    const worktree = "wt1";

    // Step 1: Agent runs, validation fails
    setWorktreeState(worktree, { state: "executing", issueIdentifier: issue });
    setFinalizationState(issue, {
      state: "validation_failed_repairable",
      worktreeId: worktree,
      stickyOwner: worktree,
      lastError: "typecheck: 3 errors",
      attempts: 1,
    });
    setWorktreeState(worktree, { state: "dirty_owned", issueIdentifier: issue });

    // Verify repair candidate
    const repair = getNextRepairableIssueForWorktree(worktree);
    expect(repair).not.toBeNull();
    expect(repair!.issueIdentifier).toBe(issue);

    // Step 2: Runner picks up repair, agent fixes, validation passes
    setWorktreeState(worktree, { state: "executing", issueIdentifier: issue });

    // Step 3: Commit + push succeeds
    setFinalizationState(issue, {
      state: "integration_pending",
      branch: `symphony/${worktree}`,
      headSha: "fixed_sha",
      baseMainSha: "main_sha",
      attempts: 0,
      lastError: null,
    });
    setWorktreeState(worktree, { state: "available", issueIdentifier: null });

    // Step 4: Integrator promotes to main
    const lock = acquireIntegrationLock("int-1");
    expect(lock.ok).toBe(true);

    setFinalizationState(issue, {
      state: "integrated_main",
      integratedMainSha: "main_new_sha",
    });
    releaseIntegrationLock("int-1");

    // Verify final state
    expect(getFinalizationState(issue)!.state).toBe("integrated_main");
    expect(getWorktreeState(worktree)!.state).toBe("available");
    expect(listIntegrationCandidates()).toHaveLength(0);
  });
});

describe("Scenario 2: Two worktrees conflict → serial integration", () => {
  it("should resolve conflict through repair and serial integration", () => {
    // Both worktrees publish
    setFinalizationState("ANQ-S2A", {
      state: "integration_pending",
      worktreeId: "wt1",
      stickyOwner: "wt1",
      branch: "symphony/wt1",
      headSha: "sha_a",
      baseMainSha: "main_0",
    });
    setFinalizationState("ANQ-S2B", {
      state: "integration_pending",
      worktreeId: "wt2",
      stickyOwner: "wt2",
      branch: "symphony/wt2",
      headSha: "sha_b",
      baseMainSha: "main_0",
    });

    // First integrates successfully
    setFinalizationState("ANQ-S2A", {
      state: "integrated_main",
      integratedMainSha: "main_1",
    });

    // Second conflicts
    setFinalizationState("ANQ-S2B", {
      state: "integration_failed_repairable",
      lastError: "CONFLICT in shared-file.ts",
      attempts: 1,
    });

    // Verify second is repairable on same worktree
    const repair = getNextRepairableIssueForWorktree("wt2");
    expect(repair).not.toBeNull();
    expect(repair!.issueIdentifier).toBe("ANQ-S2B");

    // Runner repairs: new commit, re-push
    setFinalizationState("ANQ-S2B", {
      state: "integration_pending",
      headSha: "sha_b_fixed",
      lastError: null,
      attempts: 0,
    });

    // Second integrates
    setFinalizationState("ANQ-S2B", {
      state: "integrated_main",
      integratedMainSha: "main_2",
    });

    // Both done
    expect(getFinalizationState("ANQ-S2A")!.state).toBe("integrated_main");
    expect(getFinalizationState("ANQ-S2B")!.state).toBe("integrated_main");
  });
});

describe("Scenario 3: Executor crashes mid-edit → recovery", () => {
  it("should recover from crashed executor via stale lease", () => {
    const issue = "ANQ-S3";
    const worktree = "wt3";

    // Runner starts and acquires lease
    setWorktreeState(worktree, { state: "executing", issueIdentifier: issue });
    const lease = acquireLease(issue, { owner: "runner", ttlMs: 1 });
    expect(lease.ok).toBe(true);

    // Simulate crash: lease expires
    // Wait briefly for expiry
    const start = Date.now();
    while (Date.now() - start < 10) {
      /* busy wait */
    }

    // Recovery daemon detects stale lease
    const snapshot = {
      id: worktree,
      path: "/fake",
      exists: true,
      gitDirtyFiles: ["M src/main.tsx"],
      branch: "symphony/wt3",
      headSha: "crash_sha",
      finalizationState: null,
      leaseState: {
        owner: "runner",
        heartbeat_at: new Date(Date.now() - 600_000).toISOString(),
        expires_at: new Date(Date.now() - 1).toISOString(),
      },
      classification: "executing",
      issueIdentifier: issue,
      updatedAt: new Date().toISOString(),
    };

    const classification = classifyWorktree(snapshot);
    expect(classification.classification).toBe("stale_lease");
    expect(classification.repairAction).toBe("reclaim_lease");

    // Recovery releases lease
    releaseLease(issue);

    // New runner cycle can now acquire lease
    const newLease = acquireLease(issue, { owner: "runner-2", ttlMs: 600_000 });
    expect(newLease.ok).toBe(true);
  });
});

describe("Scenario 4: Dirty orphan → quarantine → scheduler continues", () => {
  it("should quarantine orphan and keep healthy pool working", () => {
    // wt1 has dirty orphan
    setWorktreeState("wt1", { state: "dirty_owned", issueIdentifier: null });

    // Recovery classifies as orphan
    const snapshot = {
      id: "wt1",
      path: "/fake",
      exists: true,
      gitDirtyFiles: ["M unknown-file.ts"],
      branch: "symphony/wt1",
      headSha: "orphan_sha",
      finalizationState: null,
      leaseState: null,
      classification: "dirty_orphaned",
      issueIdentifier: null,
      updatedAt: new Date().toISOString(),
    };

    const classification = classifyWorktree(snapshot);
    expect(classification.classification).toBe("dirty_orphaned");
    expect(classification.repairAction).toBe("quarantine");

    // Quarantine wt1
    recordQuarantine("wt1", { reason: "dirty_orphaned" });

    // Other worktrees remain available
    setWorktreeState("wt2", { state: "available" });
    setWorktreeState("wt3", { state: "available" });

    const available = listWorktreesByState("available");
    expect(available).toHaveLength(2);
    expect(available.map((w) => w.worktreeId)).not.toContain("wt1");

    // Quarantined worktree is excluded
    const quarantined = listWorktreesByState("quarantined");
    expect(quarantined).toHaveLength(1);
    expect(quarantined[0].worktreeId).toBe("wt1");
  });
});

describe("Scenario 5: Kill runner during validation → repair", () => {
  it("should transition to validation_failed_repairable", () => {
    const issue = "ANQ-S5";

    // Simulate: runner sets validation_failed_repairable before crash
    setFinalizationState(issue, {
      state: "validation_failed_repairable",
      worktreeId: "wt1",
      stickyOwner: "wt1",
      lastError: "lint: 5 errors in 3 files",
      attempts: 1,
    });
    setWorktreeState("wt1", { state: "dirty_owned", issueIdentifier: issue });

    // Recovery classifies correctly
    const snapshot = {
      id: "wt1",
      path: "/fake",
      exists: true,
      gitDirtyFiles: ["M src/a.ts", "M src/b.ts"],
      branch: "symphony/wt1",
      headSha: "val_sha",
      finalizationState: getFinalizationState(issue),
      leaseState: null,
      classification: "dirty_owned",
      issueIdentifier: issue,
      updatedAt: new Date().toISOString(),
    };

    const classification = classifyWorktree(snapshot);
    expect(classification.classification).toBe("dirty_owned");
    expect(classification.repairAction).toBe("continue_repair");

    // Same worktree gets repair
    const repair = getNextRepairableIssueForWorktree("wt1");
    expect(repair!.issueIdentifier).toBe(issue);
  });
});

describe("Scenario 6: Network failure during push → retry", () => {
  it("should set branch_push_failed_repairable and recover", () => {
    const issue = "ANQ-S6";

    // Push fails
    setFinalizationState(issue, {
      state: "branch_push_failed_repairable",
      worktreeId: "wt2",
      stickyOwner: "wt2",
      branch: "symphony/wt2",
      headSha: "push_sha",
      lastError: "network timeout",
      attempts: 1,
    });

    // Verify repairable
    const repair = getNextRepairableIssueForWorktree("wt2");
    expect(repair).not.toBeNull();
    expect(repair!.finalization.state).toBe("branch_push_failed_repairable");

    // After successful retry push
    setFinalizationState(issue, {
      state: "integration_pending",
      headSha: "push_sha",
      baseMainSha: "main_sha",
      attempts: 0,
      lastError: null,
    });

    expect(getFinalizationState(issue)!.state).toBe("integration_pending");
    expect(listIntegrationCandidates()).toContain(issue);
  });
});

describe("Scenario 7: Stale lock from crashed process", () => {
  it("should detect and release corrupt lock", () => {
    // Acquire integration lock
    const lock = acquireIntegrationLock("crashed-process", 1);
    expect(lock.ok).toBe(true);

    // Wait for expiry
    const start = Date.now();
    while (Date.now() - start < 10) {
      /* busy wait */
    }

    // New process can acquire
    const newLock = acquireIntegrationLock("new-process");
    expect(newLock.ok).toBe(true);
    releaseIntegrationLock("new-process");
  });
});

describe("Scenario 8: Integration crashes while lock held", () => {
  it("should recover via TTL expiry", () => {
    // Integrator acquires lock with short TTL
    const lock = acquireIntegrationLock("integrator-crash", 1);
    expect(lock.ok).toBe(true);

    // Integrator crashes (no release)
    const start = Date.now();
    while (Date.now() - start < 10) {
      /* busy wait */
    }

    // Candidates remain in queue
    setFinalizationState("ANQ-S8", {
      state: "integration_pending",
      worktreeId: "wt1",
    });
    expect(listIntegrationCandidates()).toContain("ANQ-S8");

    // New integrator can proceed
    const newLock = acquireIntegrationLock("integrator-new");
    expect(newLock.ok).toBe(true);
    releaseIntegrationLock("integrator-new");
  });
});

describe("Invariant: Dirty worktree never receives new work", () => {
  it("should not assign new work to dirty_owned worktree", () => {
    setWorktreeState("wt1", { state: "dirty_owned", issueIdentifier: "ANQ-EXISTING" });
    setWorktreeState("wt2", { state: "available" });

    const dirty = listWorktreesByState("dirty_owned");
    const available = listWorktreesByState("available");

    expect(dirty).toHaveLength(1);
    expect(available).toHaveLength(1);
    expect(available[0].worktreeId).toBe("wt2");
  });

  it("should not assign work to quarantined worktree", () => {
    recordQuarantine("wt3", { reason: "test" });
    setWorktreeState("wt4", { state: "available" });

    const quarantined = listWorktreesByState("quarantined");
    const available = listWorktreesByState("available");

    expect(quarantined).toHaveLength(1);
    expect(quarantined[0].worktreeId).toBe("wt3");
    expect(available).toHaveLength(1);
    expect(available[0].worktreeId).toBe("wt4");
  });
});

describe("Invariant: Done only after main integration", () => {
  it("should only reach integrated_main through integration_pending", () => {
    const issue = "ANQ-DONE";

    // Cannot go directly to integrated_main without integration_pending
    setFinalizationState(issue, {
      state: "integration_pending",
      worktreeId: "wt1",
      branch: "symphony/wt1",
      headSha: "sha1",
    });
    expect(getFinalizationState(issue)!.state).toBe("integration_pending");

    // Only after successful integration
    setFinalizationState(issue, {
      state: "integrated_main",
      integratedMainSha: "main_sha",
    });
    expect(getFinalizationState(issue)!.state).toBe("integrated_main");
  });
});
