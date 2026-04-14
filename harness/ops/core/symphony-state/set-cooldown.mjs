import { transitionIssue } from "./transition-issue.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

/**
 * Put an issue into cooldown.
 *
 * Remediation Blocker 2: delegates to `transitionIssue("cooldown")`
 * instead of raw `patchIssueState` so the lifecycle transition is
 * validated and recorded in history.
 *
 * Falls back to metadata-only patch when the transition is not valid
 * from the current phase (e.g., issue already in a post-execution
 * finalization state).
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

  // Fallback: current phase does not allow → cooldown (e.g., issue is
  // in integration_pending). Apply metadata only — the cooldown field
  // will take effect when the issue returns to a phase that checks it.
  const patch = {
    cooldown_until: metadata.cooldown_until,
    last_failure_reason: reason,
  };
  if (signature !== null) patch.last_failure_signature = signature;
  return patchIssueState(issueIdentifier, patch);
}
