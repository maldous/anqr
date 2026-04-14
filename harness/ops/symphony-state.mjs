export * from "./core/symphony-state.mjs";
// v2: also exports getFinalizationState, listIntegrationCandidates,
// acquireIntegrationLock, releaseIntegrationLock, getNextRepairableIssueForWorktree,
// listRepairableIssuesForWorktree
// Phase 2: setFinalizationState / setWorktreeState removed from production exports —
// all production callers migrated to transitionIssue() / transitionWorktree().
// Phase 5: enqueueIntegrationCandidate / dequeueIntegrationCandidate removed —
// integration candidates are derived from finalization.state.
