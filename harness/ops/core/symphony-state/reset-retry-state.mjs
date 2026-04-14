import { getIssueState } from "./get-issue-state.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { transitionIssue } from "./transition-issue.mjs";

/**
 * Reset retry state on an issue, making it eligible again.
 *
 * Delegates to `transitionIssue("eligible")` so the lifecycle transition
 * is validated and recorded in history.
 *
 * If the issue is already eligible, returns the current state as a no-op
 * (not an error — callers like `reset-queue.mjs` iterate all issues).
 *
 * If the transition is rejected from a non-eligible phase, logs a
 * warning and returns null. Lifecycle-significant fields
 * (`retry_exhausted`, `blocked_reason`, `lease`, `cooldown_until`)
 * are NEVER written through a raw patch fallback.
 */
export function resetRetryState(issueIdentifier, details = {}) {
  // Guard: if already eligible, no transition needed — return as no-op.
  const current = getIssueState(issueIdentifier);
  const phase = inferExecutionPhase(current);
  if (phase === "eligible") return current;

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

  // Transition rejected — do NOT silently mutate lifecycle state.
  console.warn(
    `[resetRetryState] transition ${result.from} → eligible rejected for ${issueIdentifier}`,
  );
  return null;
}
