import { transitionIssue } from "./transition-issue.mjs";

/**
 * Put an issue into cooldown.
 *
 * Delegates to `transitionIssue("cooldown")` so the lifecycle transition
 * is validated and recorded in history.
 *
 * If the transition is rejected (issue is in a phase that cannot reach
 * cooldown), logs a warning and returns null. Callers should handle the
 * null return gracefully.
 *
 * Lifecycle-significant fields (`cooldown_until`) are NEVER written
 * through a raw patch fallback — if the transition is invalid, the
 * issue state is not mutated.
 */
export function setCooldown(issueIdentifier, ms, reason = "cooldown", signature = null) {
  const metadata = {
    cooldown_until: new Date(Date.now() + ms).toISOString(),
    last_failure_reason: reason,
    reason: "cooldown_set",
  };
  if (signature !== null) metadata.last_failure_signature = signature;

  const result = transitionIssue(issueIdentifier, "cooldown", metadata);
  if (result.ok) return result.record;

  // Transition rejected — do NOT silently mutate lifecycle state.
  console.warn(
    `[setCooldown] transition ${result.from} → cooldown rejected for ${issueIdentifier}`,
  );
  return null;
}
