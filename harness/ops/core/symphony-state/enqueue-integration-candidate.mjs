/**
 * @deprecated Phase 5: the integration queue is now derived from
 * `finalization.state` on each issue record.  Explicit enqueue is a
 * no-op — setting `finalization.state` to `integration_pending` (via
 * `transitionIssue`) is what makes an issue an integration candidate.
 *
 * Retained for backwards compatibility; will be removed in a future pass.
 */

let warned = false;

export function enqueueIntegrationCandidate(_issueIdentifier) {
  if (!warned) {
    console.warn(
      "[symphony-state] enqueueIntegrationCandidate is deprecated (Phase 5). " +
        "Integration candidates are derived from finalization.state.",
    );
    warned = true;
  }
  return [];
}
