import { isMissingFromLocalExecution } from "./is-missing-from-local-execution.mjs";

/**
 * @param {object} opts
 * @param {object} opts.capacity
 * @param {object} opts.queueSnapshot
 * @param {Array<{identifier: string, title: string}>} opts.eligibleTodoIssues
 * @param {Set<string>} opts.activeLeases
 * @param {Array<string>} opts.integrationCandidates
 * @param {Record<string, {state: string, updatedAt: string}>} opts.finalizationStates
 * @param {Array<{identifier: string, id: string}>} [opts.inProgressIssues=[]]
 * @param {Set<string>} [opts.activeIssueIdentifiers=new Set()]
 * @param {Array<{identifier: string, id: string}>} [opts.inReviewIssues=[]]
 */
export function computeReconciliationActions({
  capacity,
  queueSnapshot,
  eligibleTodoIssues,
  activeLeases,
  integrationCandidates,
  finalizationStates,
  inProgressIssues = [],
  activeIssueIdentifiers = new Set(),
  inReviewIssues = [],
}) {
  const actions = [];

  const activeCount = queueSnapshot.activeDepth;
  const dispatchBudget = Math.max(0, capacity.healthy - activeCount);

  const toRecoverTodo = eligibleTodoIssues.filter((issue) =>
    isMissingFromLocalExecution(issue.identifier, activeLeases, activeIssueIdentifiers),
  );

  for (const issue of toRecoverTodo.slice(0, dispatchBudget)) {
    actions.push({
      type: "dispatch",
      issueIdentifier: issue.identifier,
      title: issue.title,
      reason: "reconciler_backlog_pickup",
    });
  }

  for (const issue of inProgressIssues) {
    if (!activeLeases.has(issue.identifier)) {
      actions.push({
        type: "recover_in_progress",
        issueIdentifier: issue.identifier,
        issueId: issue.id,
        reason: "in_progress_without_active_lease",
      });
    }
  }

  // Orphaned In Review issues: in In Review in Linear but with no local
  // finalization state. These are invisible to the integrator and were
  // previously permanently stuck because the reconciler only scanned
  // In Progress. Return them to Todo for re-dispatch.
  //
  // Recency guard: skip issues updated within the last 120 seconds to
  // avoid prematurely recovering an issue that a runner is mid-transitioning
  // (between updateIssue → In Review and transitionIssue → integration_pending).
  const IN_REVIEW_RECENCY_MS = 120_000;
  const now = Date.now();
  for (const issue of inReviewIssues) {
    const fin = finalizationStates[issue.identifier];
    const updatedAtMs = issue.updatedAt ? new Date(issue.updatedAt).getTime() : 0;
    const isRecent = (now - updatedAtMs) < IN_REVIEW_RECENCY_MS;
    if (!fin && !isRecent) {
      actions.push({
        type: "recover_in_review",
        issueIdentifier: issue.identifier,
        issueId: issue.id,
        reason: "in_review_without_finalization",
      });
    }
  }

  for (const [identifier, fin] of Object.entries(finalizationStates)) {
    if (!fin) continue;
    const age = Date.now() - new Date(fin.updatedAt || 0).getTime();
    const queueMissing = !integrationCandidates.includes(identifier);
    if (
      ["integration_pending", "evidence_pending_closeout"].includes(fin.state) &&
      (queueMissing || age > 10 * 60 * 1000)
    ) {
      actions.push({
        type: "re_enqueue_integration",
        issueIdentifier: identifier,
        reason: queueMissing ? "integration_queue_missing" : "stale_integration_pending",
        ageMs: age,
      });
    }
  }

  return {
    actions,
    summary: {
      healthyCapacity: capacity.healthy,
      availableCapacity: capacity.available,
      activeCount,
      dispatchBudget,
      eligibleCount: eligibleTodoIssues.length,
      dispatchCount: actions.filter((a) => a.type === "dispatch").length,
      staleRecoveryCount: actions.filter((a) => a.type === "recover_in_progress").length,
      orphanedReviewCount: actions.filter((a) => a.type === "recover_in_review").length,
      staleIntegrationCount: actions.filter((a) => a.type === "re_enqueue_integration").length,
    },
  };
}
