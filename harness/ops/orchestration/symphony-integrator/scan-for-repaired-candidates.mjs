/**
 * @deprecated Phase 5: the integration queue is now derived from
 * `finalization.state` on each issue record.  Scanning for missed
 * candidates is unnecessary because `listIntegrationCandidates()`
 * always reflects the current finalization state of every issue.
 *
 * Retained as a no-op for backwards compatibility.
 */
export function scanForRepairedCandidates() {
  // No-op — derived queue handles this automatically.
}
