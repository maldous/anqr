import { getIssueState } from "./get-issue-state.mjs";
import { transitionIssue } from "./transition-issue.mjs";

/**
 * Mark an issue as human-only (blocked).
 *
 * Delegates to `transitionIssue("blocked")` so the lifecycle transition
 * is validated and recorded in history.
 *
 * If the transition is rejected, logs a warning and returns null.
 * Lifecycle-significant fields (`human_only`, `blocked_reason`) are
 * NEVER written through a raw patch fallback.
 */
export function markIssueHumanOnly(issueIdentifier, extra = {}) {
  const source = extra.source || getIssueState(issueIdentifier)?.source || "human";

  const metadata = {
    human_only: true,
    blocked_reason: extra.blocked_reason || null,
    source,
    reason: "human_only",
  };

  const result = transitionIssue(issueIdentifier, "blocked", metadata);
  if (result.ok) return result.record;

  // Transition rejected — do NOT silently mutate lifecycle state.
  console.warn(
    `[markIssueHumanOnly] transition ${result.from} → blocked rejected for ${issueIdentifier}`,
  );
  return null;
}
