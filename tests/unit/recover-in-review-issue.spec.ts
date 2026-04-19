import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock symphony-state at the resolved path used by source modules
vi.mock("../../harness/ops/symphony-state.mjs", () => ({
  releaseLease: vi.fn().mockReturnValue({ ok: true, released: true }),
  getIssueState: vi.fn().mockReturnValue(null),
  getFinalizationState: vi.fn().mockReturnValue(null),
}));

vi.mock("../../harness/ops/linear-client.mjs", () => ({
  updateIssue: vi.fn().mockResolvedValue({ ok: true }),
  addComment: vi.fn().mockResolvedValue({ id: "comment-1" }),
  STATES: {
    backlog: "backlog-id",
    todo: "todo-id",
    inProgress: "in-progress-id",
    inReview: "in-review-id",
    done: "done-id",
    canceled: "canceled-id",
  },
}));

vi.mock("../../harness/ops/orchestration/linear-reconciler/logger.mjs", () => ({
  logWarn: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

describe("computeReconciliationActions — orphaned In Review recovery", () => {
  const baseOpts = {
    capacity: { healthy: 4 },
    queueSnapshot: { activeDepth: 0 },
    eligibleTodoIssues: [] as Array<{ identifier: string; title: string }>,
    activeLeases: new Set<string>(),
    integrationCandidates: [] as string[],
    finalizationStates: {} as Record<string, { state: string; updatedAt: string }>,
    inProgressIssues: [] as Array<{ identifier: string; id: string }>,
    activeIssueIdentifiers: new Set<string>(),
  };

  it("detects orphaned In Review issues with no local finalization", async () => {
    const { computeReconciliationActions } = await import(
      "../../harness/ops/orchestration/linear-reconciler/compute-reconciliation-actions/compute-reconciliation-actions.mjs"
    );
    const inReviewIssues = [
      { identifier: "ANQ-1680", id: "issue-1680", updatedAt: "2026-04-18T10:00:00.000Z" },
      { identifier: "ANQ-1673", id: "issue-1673", updatedAt: "2026-04-18T09:00:00.000Z" },
    ];
    const { actions, summary } = computeReconciliationActions({
      ...baseOpts,
      inReviewIssues,
    });

    const reviewActions = actions.filter((a: any) => a.type === "recover_in_review");
    expect(reviewActions).toHaveLength(2);
    expect(reviewActions[0].issueIdentifier).toBe("ANQ-1680");
    expect(reviewActions[0].reason).toBe("in_review_without_finalization");
    expect(summary.orphanedReviewCount).toBe(2);
  });

  it("skips In Review issues that have local finalization state", async () => {
    const { computeReconciliationActions } = await import(
      "../../harness/ops/orchestration/linear-reconciler/compute-reconciliation-actions/compute-reconciliation-actions.mjs"
    );
    const inReviewIssues = [
      { identifier: "ANQ-1680", id: "issue-1680", updatedAt: "2026-04-18T10:00:00.000Z" },
    ];
    const finalizationStates = {
      "ANQ-1680": { state: "integration_pending", updatedAt: "2026-04-18T10:00:00.000Z" },
    };
    const { actions, summary } = computeReconciliationActions({
      ...baseOpts,
      inReviewIssues,
      finalizationStates,
    });

    const reviewActions = actions.filter((a: any) => a.type === "recover_in_review");
    expect(reviewActions).toHaveLength(0);
    expect(summary.orphanedReviewCount).toBe(0);
  });

  it("skips recently-updated In Review issues (recency guard)", async () => {
    const { computeReconciliationActions } = await import(
      "../../harness/ops/orchestration/linear-reconciler/compute-reconciliation-actions/compute-reconciliation-actions.mjs"
    );
    const recent = new Date(Date.now() - 30_000).toISOString();
    const inReviewIssues = [
      { identifier: "ANQ-NEW", id: "issue-new", updatedAt: recent },
    ];
    const { actions } = computeReconciliationActions({
      ...baseOpts,
      inReviewIssues,
    });

    const reviewActions = actions.filter((a: any) => a.type === "recover_in_review");
    expect(reviewActions).toHaveLength(0);
  });

  it("recovers old orphaned In Review issues past recency guard", async () => {
    const { computeReconciliationActions } = await import(
      "../../harness/ops/orchestration/linear-reconciler/compute-reconciliation-actions/compute-reconciliation-actions.mjs"
    );
    const old = new Date(Date.now() - 300_000).toISOString();
    const inReviewIssues = [
      { identifier: "ANQ-OLD", id: "issue-old", updatedAt: old },
    ];
    const { actions } = computeReconciliationActions({
      ...baseOpts,
      inReviewIssues,
    });

    const reviewActions = actions.filter((a: any) => a.type === "recover_in_review");
    expect(reviewActions).toHaveLength(1);
    expect(reviewActions[0].issueIdentifier).toBe("ANQ-OLD");
  });

  it("defaults inReviewIssues to empty array (backward compatible)", async () => {
    const { computeReconciliationActions } = await import(
      "../../harness/ops/orchestration/linear-reconciler/compute-reconciliation-actions/compute-reconciliation-actions.mjs"
    );
    const { actions, summary } = computeReconciliationActions(baseOpts);
    const reviewActions = actions.filter((a: any) => a.type === "recover_in_review");
    expect(reviewActions).toHaveLength(0);
    expect(summary.orphanedReviewCount).toBe(0);
  });
});

describe("recoverInReviewIssue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("releases lease and returns issue to Todo with comment", async () => {
    const { recoverInReviewIssue } = await import(
      "../../harness/ops/orchestration/linear-reconciler/run-reconciliation-cycle/recover-in-review-issue.mjs"
    );
    const { updateIssue, addComment, STATES } = await import(
      "../../harness/ops/linear-client.mjs"
    );
    const { releaseLease } = await import("../../harness/ops/symphony-state.mjs");

    const action = {
      type: "recover_in_review" as const,
      issueIdentifier: "ANQ-1680",
      issueId: "issue-1680",
      reason: "in_review_without_finalization",
    };

    const result = await recoverInReviewIssue(action);

    expect(result).toBe(true);
    expect(releaseLease).toHaveBeenCalledWith("ANQ-1680");
    expect(updateIssue).toHaveBeenCalledWith("issue-1680", { stateId: STATES.todo });
    expect(addComment).toHaveBeenCalledWith(
      "issue-1680",
      expect.stringContaining("Recovered by reconciler"),
    );
  });

  it("returns false on API error", async () => {
    const { recoverInReviewIssue } = await import(
      "../../harness/ops/orchestration/linear-reconciler/run-reconciliation-cycle/recover-in-review-issue.mjs"
    );
    const { updateIssue } = await import("../../harness/ops/linear-client.mjs");

    vi.mocked(updateIssue).mockRejectedValueOnce(new Error("API timeout"));

    const action = {
      type: "recover_in_review" as const,
      issueIdentifier: "ANQ-1680",
      issueId: "issue-1680",
      reason: "in_review_without_finalization",
    };

    const result = await recoverInReviewIssue(action);
    expect(result).toBe(false);
  });
});
