import { describe, it, expect } from "vitest";

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
      eligibleTodoIssues: [makeIssue("ANQ-1"), makeIssue("ANQ-2"), makeIssue("ANQ-3"), makeIssue("ANQ-4")],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
      activeIssueIdentifiers: new Set(),
    });

    expect(result.summary.dispatchBudget).toBe(2);
    expect(result.summary.dispatchCount).toBe(2);
  });

  it("does not dispatch duplicate Todo issues already active locally", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [makeIssue("ANQ-1"), makeIssue("ANQ-2")],
      activeLeases: new Set(["ANQ-1"]),
      integrationCandidates: [],
      finalizationStates: {},
      activeIssueIdentifiers: new Set(["ANQ-1"]),
    });

    const dispatched = result.actions.filter((a) => a.type === "dispatch");
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].issueIdentifier).toBe("ANQ-2");
  });

  it("adds stale In Progress recovery when no active lease exists", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(1),
      eligibleTodoIssues: [],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {},
      inProgressIssues: [{ identifier: "ANQ-9", id: "issue-9" }],
      activeIssueIdentifiers: new Set(["ANQ-9"]),
    });

    const recoveries = result.actions.filter((a) => a.type === "recover_in_progress");
    expect(recoveries).toHaveLength(1);
    expect(recoveries[0].issueIdentifier).toBe("ANQ-9");
  });

  it("re-enqueues integration work when queue entry is missing", () => {
    const result = computeReconciliationActions({
      capacity: makeCapacity(4, 4),
      queueSnapshot: makeSnap(0),
      eligibleTodoIssues: [],
      activeLeases: new Set(),
      integrationCandidates: [],
      finalizationStates: {
        "ANQ-10": { state: "integration_pending", updatedAt: new Date().toISOString() },
      },
      activeIssueIdentifiers: new Set(),
    });

    const reEnqueue = result.actions.filter((a) => a.type === "re_enqueue_integration");
    expect(reEnqueue).toHaveLength(1);
    expect(reEnqueue[0].reason).toBe("integration_queue_missing");
  });
});
