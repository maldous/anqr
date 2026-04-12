export function computeReconciliationActions({
  capacity,
  queueSnapshot,
  eligibleTodoIssues,
  activeLeases,
  integrationCandidates,
  finalizationStates,
}) {
  const actions = [];

  const activeCount = queueSnapshot.activeDepth;
  const dispatchBudget = Math.max(0, capacity.healthy - activeCount);

  const toDispatch = eligibleTodoIssues
    .filter((issue) => !activeLeases.has(issue.identifier))
    .slice(0, dispatchBudget);

  for (const issue of toDispatch) {
    actions.push({
      type: "dispatch",
      issueIdentifier: issue.identifier,
      title: issue.title,
      reason: "reconciler_backlog_pickup",
    });
  }

  for (const identifier of integrationCandidates) {
    const fin = finalizationStates[identifier];
    if (!fin || fin.state !== "integration_pending") continue;
    const age = Date.now() - new Date(fin.updatedAt || 0).getTime();
    if (age > 10 * 60 * 1000) {
      actions.push({
        type: "re_enqueue_integration",
        issueIdentifier: identifier,
        reason: "stale_integration_pending",
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
      dispatchCount: toDispatch.length,
      staleIntegrationCount: actions.filter((a) => a.type === "re_enqueue_integration").length,
    },
  };
}
