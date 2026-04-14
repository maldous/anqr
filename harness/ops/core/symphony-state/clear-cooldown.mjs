import { getIssueState } from "./get-issue-state.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { transitionIssue } from "./transition-issue.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Clear cooldown on an issue.
 *
 * When the issue is in cooldown phase, delegates to
 * `transitionIssue("eligible")` so the lifecycle transition is
 * validated and recorded.
 *
 * When the issue is in another phase (e.g., executing with a stale
 * `cooldown_until` field), clears the metadata field directly. This
 * is safe because `cooldown_until` does not determine the phase when
 * a higher-priority field (active lease, blocked state) is present.
 *
 * Does NOT use `patchIssueState` — metadata-only cleanup uses a
 * direct locked write limited to the single field.
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

    // Race: phase changed between check and transition. Fall through
    // to metadata-only clear so the issue is not stuck with a stale
    // cooldown_until field.
    console.warn(
      `[clearCooldown] transition cooldown → eligible rejected for ${issueIdentifier} (race) — clearing metadata`,
    );
  }

  // Not in cooldown (or race fallback): clear stale cooldown_until
  // field as metadata-only cleanup. This is safe because another
  // field (active lease, blocked state) already determines the phase.
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    current.cooldown_until = null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return current;
  });
}
