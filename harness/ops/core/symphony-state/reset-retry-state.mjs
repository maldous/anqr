import { transitionIssue } from "./transition-issue.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

/**
 * Reset retry state on an issue, making it eligible again.
 *
 * Remediation Blocker 2: delegates to `transitionIssue("eligible")`
 * so the lifecycle transition is validated and recorded in history.
 */
export function resetRetryState(issueIdentifier, details = {}) {
  const metadata = {
    retry_count: Number(details.retry_count ?? 0),
    retry_exhausted: false,
    blocked_reason: null,
    cooldown_until: null,
    lease: null,
    last_failure_reason: null,
    last_failure_signature: null,
    reason: "retry_reset",
  };

  const result = transitionIssue(issueIdentifier, "eligible", metadata);
  if (result.ok) return result.record;

  // Fallback: transition not valid from current phase.
  const { reason: _reason, ...patch } = metadata;
  return patchIssueState(issueIdentifier, patch);
}
