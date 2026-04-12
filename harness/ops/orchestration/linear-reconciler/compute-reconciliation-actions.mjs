function isMissingFromLocalExecution(issueIdentifier, activeLeases, activeIssueIdentifiers) {
  return !activeLeases.has(issueIdentifier) && !activeIssueIdentifiers.has(issueIdentifier);
}

export function computeReconciliationActions({
  capacity,
  queueSnapshot,
  eligibleTodoIssues,
  activeLeases,
  integrationCandidates,
  finalizationStates,
  inProgressIssues = [],
  activeIssueIdentifiers = new Set(),
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
      staleIntegrationCount: actions.filter((a) => a.type === "re_enqueue_integration").length,
    },
  };
}
