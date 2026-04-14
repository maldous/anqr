/**
 * @deprecated Phase 5: the integration queue is now derived from
 * `finalization.state` on each issue record.  Explicit dequeue is a
 * no-op — changing `finalization.state` away from `integration_pending`
 * or `evidence_pending_closeout` (via `transitionIssue`) is what
 * removes an issue from the derived candidate list.
 *
 * Retained for backwards compatibility; will be removed in a future pass.
 */

let warned = false;

export function dequeueIntegrationCandidate(_issueIdentifier) {
  if (!warned) {
    console.warn(
      "[symphony-state] dequeueIntegrationCandidate is deprecated (Phase 5). " +
        "Integration candidates are derived from finalization.state.",
    );
    warned = true;
  }
  return [];
}
