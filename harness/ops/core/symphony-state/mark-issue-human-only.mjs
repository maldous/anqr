import { getIssueState } from "./get-issue-state.mjs";
import { transitionIssue } from "./transition-issue.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

/**
 * Mark an issue as human-only (blocked).
 *
 * Remediation Blocker 2: delegates to `transitionIssue("blocked")`
 * so the lifecycle transition is validated and recorded in history.
 */
export function markIssueHumanOnly(issueIdentifier, extra = {}) {
  const source =
    extra.source || getIssueState(issueIdentifier)?.source || "human";

  const metadata = {
    human_only: true,
    blocked_reason: extra.blocked_reason || null,
    source,
    reason: "human_only",
  };

  const result = transitionIssue(issueIdentifier, "blocked", metadata);
  if (result.ok) return result.record;

  // Fallback: transition not valid from current phase.
  const { reason: _reason, ...patch } = metadata;
  return patchIssueState(issueIdentifier, patch);
}
