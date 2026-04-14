import { getIssueState } from "./get-issue-state.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { transitionIssue } from "./transition-issue.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

/**
 * Clear cooldown on an issue.
 *
 * Remediation Blocker 2: when the issue is in cooldown phase, delegates
 * to `transitionIssue("eligible")` so the lifecycle transition is
 * validated.  When the issue is in another phase (e.g., executing with
 * a stale cooldown_until field), just clears the metadata.
 */
export function clearCooldown(issueIdentifier) {
  const state = getIssueState(issueIdentifier);
  const phase = inferExecutionPhase(state);

  if (phase === "cooldown") {
    const result = transitionIssue(issueIdentifier, "eligible", {
      cooldown_until: null,
      reason: "cooldown_cleared",
    });
    if (result.ok) return result.record;
  }

  // Not in cooldown, or transition failed — just clear the metadata field.
  return patchIssueState(issueIdentifier, { cooldown_until: null });
}
