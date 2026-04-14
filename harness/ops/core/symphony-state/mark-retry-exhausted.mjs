import { transitionIssue } from "./transition-issue.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

/**
 * Mark an issue as retry-exhausted (blocked).
 *
 * Remediation Blocker 2: delegates to `transitionIssue("blocked")`
 * so the lifecycle transition is validated and recorded in history.
 */
export function markRetryExhausted(issueIdentifier, details = {}) {
  const metadata = {
    retry_exhausted: true,
    blocked_reason: details.reason || "retry_exhausted",
    last_failure_reason: details.reason || "retry_exhausted",
    last_failure_signature: details.signature || null,
    cooldown_until: null,
    lease: null,
    reason: "retry_exhausted",
  };

  const result = transitionIssue(issueIdentifier, "blocked", metadata);
  if (result.ok) return result.record;

  // Fallback: transition not valid from current phase.
  const { reason: _reason, ...patch } = metadata;
  return patchIssueState(issueIdentifier, patch);
}
