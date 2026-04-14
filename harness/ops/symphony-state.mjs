export * from "./core/symphony-state.mjs";
// v2: also exports setFinalizationState, getFinalizationState, listIntegrationCandidates,
// acquireIntegrationLock, releaseIntegrationLock, getNextRepairableIssueForWorktree,
// listRepairableIssuesForWorktree
// Phase 5: enqueueIntegrationCandidate / dequeueIntegrationCandidate removed —
// integration candidates are derived from finalization.state.
