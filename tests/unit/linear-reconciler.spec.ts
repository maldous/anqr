import { describe, it, expect } from "vitest";

// Import the pure function directly
import { computeReconciliationActions } from "../../harness/ops/orchestration/linear-reconciler/compute-reconciliation-actions.mjs";

describe("computeReconciliationActions", () => {
  const makeCapacity = (healthy: number, available: number) => ({
    total: 4,
    healthy,
    available,
    executing: healthy - available,
    unhealthy: 4 - healthy,
    worktrees: [],
  });

  const makeSnap = (activeDepth: number, readyDepth = 0) => ({
    activeDepth,
    readyDepth,
    queueDepth: activeDepth + readyDepth,
    backlog: { all: [], automatable: [] },
    todo: { all: [], automatable: [] },
    inProgress: { all: [], automatable: [] },
  });

  const makeIssue = (identifier: string, title = "Test") => ({ identifier, title });

  it("dispatches up to healthy capacity minus active count", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 2),
      queueSnapshot: makeSnap(2),
      eligibleTodoIssues: [
        makeIssue("ANQ-1"),
        makeIssue("ANQ-2"),
        makeIssue("ANQ-3"),
        makeIssue("ANQ-4"),
      ],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.dispatchBudget).toBe(2);
    expect(result.summary.dispatchCount).toBe(2);
    expect(result.actions.filter((a) => a.type === "dispatch")).toHaveLength(2);
  });

  it("does not dispatch when at capacity", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 0),
      queueSnapshot: makeSnap(4),
      eligibleTodoIssues: [makeIssue("ANQ-1"), makeIssue("ANQ-2")],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.dispatchBudget).toBe(0);
    expect(result.summary.dispatchCount).toBe(0);
    expect(result.actions).toHaveLength(0);
  });

  it("skips issues that already have active leases", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [makeIssue("ANQ-1"), makeIssue("ANQ-2"), makeIssue("ANQ-3")],
      activeLeases: new Set(["ANQ-1", "ANQ-2"]),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.dispatchCount).toBe(1);
    const dispatched = result.actions.filter((a) => a.type === "dispatch");
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].issueIdentifier).toBe("ANQ-3");
  });

  it("dispatches zero when no healthy worktrees", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(0, 0),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [makeIssue("ANQ-1")],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.dispatchBudget).toBe(0);
    expect(result.actions).toHaveLength(0);
  });

  it("dispatches zero when no eligible issues", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.dispatchBudget).toBe(4);
    expect(result.summary.dispatchCount).toBe(0);
  });

  it("reduces capacity when worktrees are unhealthy", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(3, 3),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [
        makeIssue("ANQ-1"),
        makeIssue("ANQ-2"),
        makeIssue("ANQ-3"),
        makeIssue("ANQ-4"),
        makeIssue("ANQ-5"),
      ],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.healthyCapacity).toBe(3);
    expect(result.summary.dispatchBudget).toBe(3);
    expect(result.summary.dispatchCount).toBe(3);
  });

  it("detects stale integration_pending candidates", () => {
    const staleTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const freshTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [],
      activeLeases: new Set(),
      integrationCandidates: ["ANQ-10", "ANQ-11"],
      finalizationStates: {
        "ANQ-10": { state: "integration_pending", updatedAt: staleTime },
        "ANQ-11": { state: "integration_pending", updatedAt: freshTime },
      },
    });

    const reEnqueue = result.actions.filter((a) => a.type === "re_enqueue_integration");
    expect(reEnqueue).toHaveLength(1);
    expect(reEnqueue[0].issueIdentifier).toBe("ANQ-10");
  });

  it("handles mixed dispatch and re-enqueue actions", () => {
    const staleTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 2),
      queueSnapshot: makeSnap(2),
      eligibleTodoIssues: [makeIssue("ANQ-1"), makeIssue("ANQ-2"), makeIssue("ANQ-3")],
      activeLeases: new Set(),
      integrationCandidates: ["ANQ-99"],
      finalizationStates: {
        "ANQ-99": { state: "integration_pending", updatedAt: staleTime },
      },
    });

    expect(result.actions.filter((a) => a.type === "dispatch")).toHaveLength(2);
    expect(result.actions.filter((a) => a.type === "re_enqueue_integration")).toHaveLength(1);
  });

  it("caps dispatch at eligible count when budget exceeds supply", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [makeIssue("ANQ-1")],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
    });

    expect(result.summary.dispatchBudget).toBe(4);
    expect(result.summary.dispatchCount).toBe(1);
  });
});
