import { transitionIssue } from "./transition-issue.mjs";

/**
 * Mark an issue as retry-exhausted (blocked).
 *
 * Delegates to `transitionIssue("blocked")` so the lifecycle transition
 * is validated and recorded in history.
 *
 * If the transition is rejected, logs a warning and returns null.
 * Lifecycle-significant fields (`retry_exhausted`, `blocked_reason`,
 * `lease: null`) are NEVER written through a raw patch fallback.
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

  // Transition rejected — do NOT silently mutate lifecycle state.
  console.warn(
    `[markRetryExhausted] transition ${result.from} → blocked rejected for ${issueIdentifier}`,
  );
  return null;
}
