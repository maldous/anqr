import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Fields that determine the issue lifecycle phase (as read by
 * inferExecutionPhase). These MUST be written through transitionIssue()
 * so that the transition map is validated and history is recorded.
 *
 * Exported so that tests can assert the guard covers all expected fields.
 */
export const LIFECYCLE_FIELDS = new Set([
  "lease",
  "finalization",
  "completed_at",
  "human_only",
  "retry_exhausted",
  "blocked_reason",
  "cooldown_until",
]);

/**
 * Metadata-only write API — applies freeform patches to issue records
 * without lifecycle validation or phase transition enforcement.
 *
 * Use this for observation metadata such as `retry_count`, `latency_ms`,
 * `source`, `transitions`, `attempt_started_at`, `external_keys`, etc.
 *
 * **Throws** if the patch contains any lifecycle-determining field.
 * Use `transitionIssue()` for lifecycle state changes.
 */
export function patchIssueState(issueIdentifier, patch = {}) {
  const violating = Object.keys(patch).filter((k) => LIFECYCLE_FIELDS.has(k));
  if (violating.length > 0) {
    throw new Error(
      `patchIssueState: lifecycle fields [${violating.join(", ")}] must be written through transitionIssue(), not patchIssueState(). Issue: ${issueIdentifier}`,
    );
  }

  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const next = normalizeRecord({ ...current, ...patch, issueIdentifier });
    store.issues[issueIdentifier] = next;
    saveState(store);
    return next;
  });
}
