/**
 * Test: Symphony Integrator
 *
 * Integration tests for the integration queue and promotion flow.
 * These tests use the real symphony-state module but mock git operations.
 *
 * Covers:
 * - Branch-pushed issue enters integration queue
 * - Integrator marks Done only after successful main push
 * - Conflict marks integration_failed_repairable
 * - Sticky owner remains same worktree
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  mutateState,
  getFinalizationState,
  listIntegrationCandidates,
  acquireIntegrationLock,
  releaseIntegrationLock,
} from "../../harness/ops/core/symphony-state.mjs";
import { setFinalizationState } from "../../harness/ops/core/symphony-state/set-finalization-state.mjs";

beforeEach(() => {
  mutateState((store) => {
    store.issues = {};
    store.global = { integrationLock: null };
    return store;
  });
});

describe("Integration queue flow", () => {
  it("branch-pushed issue enters integration queue", () => {
    // Simulate runner completing and pushing branch
    setFinalizationState("ANQ-900", {
      state: "integration_pending",
      worktreeId: "wt1",
      stickyOwner: "wt1",
      branch: "symphony/wt1",
      headSha: "abc123def",
      baseMainSha: "main000",
    });

    const queue = listIntegrationCandidates();
    expect(queue).toContain("ANQ-900");

    const fin = getFinalizationState("ANQ-900");
    expect(fin!.state).toBe("integration_pending");
    expect(fin!.branch).toBe("symphony/wt1");
  });

  it("successful integration marks integrated_main and dequeues", () => {
    setFinalizationState("ANQ-901", {
      state: "integration_pending",
      worktreeId: "wt2",
      branch: "symphony/wt2",
      headSha: "def456",
    });

    // Simulate integrator success
    setFinalizationState("ANQ-901", {
      state: "integrated_main",
      integratedMainSha: "main123",
      lastError: null,
    });

    const fin = getFinalizationState("ANQ-901");
    expect(fin!.state).toBe("integrated_main");
    expect(fin!.integratedMainSha).toBe("main123");

    const queue = listIntegrationCandidates();
    expect(queue).not.toContain("ANQ-901");
  });

  it("conflict marks integration_failed_repairable", () => {
    setFinalizationState("ANQ-902", {
      state: "integration_pending",
      worktreeId: "wt3",
      stickyOwner: "wt3",
      branch: "symphony/wt3",
      headSha: "ghi789",
      attempts: 0,
    });

    // Simulate integrator conflict
    setFinalizationState("ANQ-902", {
      state: "integration_failed_repairable",
      lastError: "CONFLICT in src/main.tsx",
      attempts: 1,
    });

    const fin = getFinalizationState("ANQ-902");
    expect(fin!.state).toBe("integration_failed_repairable");
    expect(fin!.lastError).toContain("CONFLICT");
    expect(fin!.attempts).toBe(1);
    // Sticky owner preserved
    expect(fin!.stickyOwner).toBe("wt3");
  });

  it("sticky owner remains same worktree through failure", () => {
    setFinalizationState("ANQ-903", {
      state: "integration_pending",
      worktreeId: "wt4",
      stickyOwner: "wt4",
      branch: "symphony/wt4",
      headSha: "jkl012",
    });

    // Simulate failure
    setFinalizationState("ANQ-903", {
      state: "integration_failed_repairable",
      lastError: "push rejected",
      attempts: 1,
    });

    const fin = getFinalizationState("ANQ-903");
    // stickyOwner must survive the merge
    expect(fin!.stickyOwner).toBe("wt4");
    expect(fin!.worktreeId).toBe("wt4");
    expect(fin!.branch).toBe("symphony/wt4");
  });

  it("integration lock prevents concurrent integrators", () => {
    const lock1 = acquireIntegrationLock("integrator-1", 60_000);
    expect(lock1.ok).toBe(true);

    const lock2 = acquireIntegrationLock("integrator-2");
    expect(lock2.ok).toBe(false);

    releaseIntegrationLock("integrator-1");

    const lock3 = acquireIntegrationLock("integrator-2");
    expect(lock3.ok).toBe(true);
  });

  it("repaired candidate can be re-enqueued after conflict repair", () => {
    // Simulate initial integration_pending
    setFinalizationState("ANQ-910", {
      state: "integration_pending",
      worktreeId: "wt1",
      stickyOwner: "wt1",
      branch: "symphony/wt1",
      headSha: "abc123",
    });

    // Simulate conflict
    setFinalizationState("ANQ-910", {
      state: "integration_failed_repairable",
      lastError: "CONFLICT in src/main.tsx",
      attempts: 1,
    });

    // Simulate repair: runner fixes and re-pushes with new headSha
    setFinalizationState("ANQ-910", {
      state: "integration_pending",
      headSha: "new_sha_456",
      lastError: null,
      attempts: 0,
    });

    const queue = listIntegrationCandidates();
    expect(queue).toContain("ANQ-910");

    const fin = getFinalizationState("ANQ-910");
    expect(fin!.state).toBe("integration_pending");
    expect(fin!.headSha).toBe("new_sha_456");
    expect(fin!.stickyOwner).toBe("wt1");
  });

  it("force-pushed branch updates headSha correctly", () => {
    setFinalizationState("ANQ-911", {
      state: "integration_pending",
      worktreeId: "wt2",
      branch: "symphony/wt2",
      headSha: "original_sha",
    });

    // Force push: headSha changes
    setFinalizationState("ANQ-911", {
      headSha: "force_pushed_sha",
    });

    const fin = getFinalizationState("ANQ-911");
    expect(fin!.headSha).toBe("force_pushed_sha");
    expect(fin!.branch).toBe("symphony/wt2");
  });

  it("two branches integrate serially via lock", () => {
    setFinalizationState("ANQ-920", {
      state: "integration_pending",
      worktreeId: "wt1",
      branch: "symphony/wt1",
      headSha: "sha1",
    });
    setFinalizationState("ANQ-921", {
      state: "integration_pending",
      worktreeId: "wt2",
      branch: "symphony/wt2",
      headSha: "sha2",
    });

    // First integrator acquires lock
    const lock1 = acquireIntegrationLock("int-1", 60_000);
    expect(lock1.ok).toBe(true);

    // Second integrator blocked
    const lock2 = acquireIntegrationLock("int-2");
    expect(lock2.ok).toBe(false);

    // First integrator completes and releases
    setFinalizationState("ANQ-920", {
      state: "integrated_main",
      integratedMainSha: "main_sha_1",
    });
    releaseIntegrationLock("int-1");

    // Second integrator can now proceed
    const lock3 = acquireIntegrationLock("int-2");
    expect(lock3.ok).toBe(true);

    setFinalizationState("ANQ-921", {
      state: "integrated_main",
      integratedMainSha: "main_sha_2",
    });
    releaseIntegrationLock("int-2");

    // Both integrated
    expect(getFinalizationState("ANQ-920")!.state).toBe("integrated_main");
    expect(getFinalizationState("ANQ-921")!.state).toBe("integrated_main");
    expect(listIntegrationCandidates()).toHaveLength(0);
  });
});
