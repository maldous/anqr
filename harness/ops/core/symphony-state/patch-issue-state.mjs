import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Metadata-only write API — applies freeform patches to issue records
 * without lifecycle validation or phase transition enforcement.
 *
 * Use this for observation metadata such as `retry_count`, `latency_ms`,
 * `source`, `transitions`, `attempt_started_at`, `external_keys`, etc.
 *
 * **Do NOT use this for lifecycle state changes** (phase transitions,
 * finalization state, `completed_at`, or any field that determines the
 * current execution phase). Use `transitionIssue()` for those.
 */
export function patchIssueState(issueIdentifier, patch = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const next = normalizeRecord({ ...current, ...patch, issueIdentifier });
    store.issues[issueIdentifier] = next;
    saveState(store);
    return next;
  });
}
