import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

let _deprecationWarned = false;

/**
 * @deprecated Use `transitionIssue()` for finalization state changes (Phase 2+).
 * This helper applies freeform finalization patches without lifecycle validation.
 * It will be removed or restricted once all callers are migrated (Phase 3).
 */
export function setFinalizationState(issueIdentifier, patch = {}) {
  if (!_deprecationWarned) {
    _deprecationWarned = true;
    console.warn(
      "[deprecation] setFinalizationState() is deprecated. Use transitionIssue() instead.",
    );
  }
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const existing = current.finalization || {};
    current.finalization = normalizeRecord({
      ...current,
      finalization: {
        ...existing,
        ...patch,
        updatedAt: patch.updatedAt || new Date().toISOString(),
      },
    }).finalization;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return current.finalization;
  });
}
