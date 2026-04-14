import { transitionIssue } from "./transition-issue.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

/**
 * Record execution completion metadata.
 *
 * Remediation Blocker 2: attempts `transitionIssue("completed")` when
 * the current phase allows it (e.g., evidence_pending → completed).
 *
 * When the transition is not valid (e.g., issue is still in
 * `integration_pending` because integration hasn't run yet), falls
 * back to metadata-only patch.  With the inferExecutionPhase priority
 * fix, `completed_at` does not trump `finalization.state`, so the
 * metadata patch is safe and does not prematurely mark the phase.
 */
export function recordCompletion(issueIdentifier, details = {}) {
  const completedAt = details.completedAt || new Date().toISOString();
  const latencyMs = Number(details.latencyMs) || null;

  const result = transitionIssue(issueIdentifier, "completed", {
    completed_at: completedAt,
    latency_ms: latencyMs,
    reason: "execution_complete",
  });
  if (result.ok) return result.record;

  // Current phase does not allow → completed (expected: the runner
  // records timing before integration runs).  Apply metadata only.
  return patchIssueState(issueIdentifier, {
    completed_at: completedAt,
    latency_ms: latencyMs,
  });
}
