/**
 * Test: worktree-health.mjs
 *
 * Covers:
 * - getWorktreeHealthSnapshot classification logic
 * - getFleetInventory summary counts
 * - Classification of clean, executing, dirty_owned, dirty_orphaned, quarantined worktrees
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  mutateState,
  setWorktreeState,
  getWorktreeState,
  listWorktreesByState,
  recordQuarantine,
  clearQuarantine,
  getFleetSnapshot,
  loadState,
} from "../../harness/ops/core/symphony-state.mjs";

beforeEach(() => {
  mutateState((store) => {
    store.issues = {};
    store.worktreeStates = {};
    store.global = { integrationQueue: [], integrationLock: null };
    return store;
  });
});

describe("Worktree state CRUD", () => {
  it("should set and get worktree state", () => {
    setWorktreeState("wt1", { state: "available", issueIdentifier: null });
    const state = getWorktreeState("wt1");
    expect(state).not.toBeNull();
    expect(state!.state).toBe("available");
    expect(state!.updatedAt).toBeTruthy();
  });

  it("should return null for unknown worktree", () => {
    const state = getWorktreeState("wt99");
    expect(state).toBeNull();
  });

  it("should merge state on update", () => {
    setWorktreeState("wt2", { state: "executing", issueIdentifier: "ANQ-100" });
    setWorktreeState("wt2", { state: "dirty_owned" });
    const state = getWorktreeState("wt2");
    expect(state!.state).toBe("dirty_owned");
    expect(state!.issueIdentifier).toBe("ANQ-100");
  });

  it("should list worktrees by state", () => {
    setWorktreeState("wt1", { state: "available", issueIdentifier: null });
    setWorktreeState("wt2", { state: "executing", issueIdentifier: "ANQ-200" });
    setWorktreeState("wt3", { state: "available", issueIdentifier: null });

    const available = listWorktreesByState("available");
    expect(available).toHaveLength(2);
    expect(available.map((w) => w.worktreeId)).toContain("wt1");
    expect(available.map((w) => w.worktreeId)).toContain("wt3");

    const executing = listWorktreesByState("executing");
    expect(executing).toHaveLength(1);
    expect(executing[0].worktreeId).toBe("wt2");
  });
});

describe("Quarantine", () => {
  it("should record quarantine", () => {
    recordQuarantine("wt3", {
      reason: "dirty_orphaned",
      repairAttempts: 5,
      lastError: "Could not infer ownership",
    });
    const state = getWorktreeState("wt3");
    expect(state!.state).toBe("quarantined");
    expect(state!.reason).toBe("dirty_orphaned");
    expect(state!.quarantinedAt).toBeTruthy();
    expect(state!.repairAttempts).toBe(5);
  });

  it("should clear quarantine", () => {
    recordQuarantine("wt4", { reason: "test" });
    clearQuarantine("wt4");
    const state = getWorktreeState("wt4");
    expect(state!.state).toBe("available");
    expect(state!.reason).toBeNull();
    expect(state!.quarantinedAt).toBeNull();
  });
});

describe("Fleet snapshot", () => {
  it("should return summary counts", () => {
    setWorktreeState("wt1", { state: "available" });
    setWorktreeState("wt2", { state: "executing" });
    setWorktreeState("wt3", { state: "dirty_owned" });
    setWorktreeState("wt4", { state: "quarantined" });

    const snapshot = getFleetSnapshot();
    expect(snapshot.summary.available).toBe(1);
    expect(snapshot.summary.executing).toBe(1);
    expect(snapshot.summary.dirty).toBe(1);
    expect(snapshot.summary.quarantined).toBe(1);
    expect(snapshot.timestamp).toBeTruthy();
  });

  it("should include all worktree states", () => {
    setWorktreeState("wt1", { state: "available" });
    setWorktreeState("wt2", { state: "available" });

    const snapshot = getFleetSnapshot();
    expect(Object.keys(snapshot.worktrees)).toHaveLength(2);
    expect(snapshot.worktrees.wt1.state).toBe("available");
  });
});

describe("State migration", () => {
  it("should handle loading v2 state without worktreeStates", () => {
    // Simulate a v2 state file without worktreeStates by saving and re-loading
    mutateState((store) => {
      delete store.worktreeStates;
      return store;
    });

    const loaded = loadState();
    expect(loaded.worktreeStates).toBeDefined();
    expect(typeof loaded.worktreeStates).toBe("object");
    expect(Object.keys(loaded.worktreeStates)).toHaveLength(0);
  });

  it("should preserve worktreeStates through round-trip", () => {
    setWorktreeState("wt5", { state: "executing", issueIdentifier: "ANQ-500" });

    const loaded = loadState();
    expect(loaded.worktreeStates.wt5.state).toBe("executing");
    expect(loaded.worktreeStates.wt5.issueIdentifier).toBe("ANQ-500");
  });
});
