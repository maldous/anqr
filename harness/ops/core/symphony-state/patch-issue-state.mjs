import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

let _deprecationWarned = false;

/**
 * @deprecated Use `transitionIssue()` for lifecycle state changes (Phase 2+).
 * This helper applies freeform patches without lifecycle validation.
 * It will be removed or restricted once all callers are migrated (Phase 3).
 */
export function patchIssueState(issueIdentifier, patch = {}) {
  if (!_deprecationWarned) {
    _deprecationWarned = true;
    console.warn(
      "[deprecation] patchIssueState() is deprecated for lifecycle changes. Use transitionIssue() instead.",
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
