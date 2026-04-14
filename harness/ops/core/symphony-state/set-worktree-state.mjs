import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

let _deprecationWarned = false;

/**
 * @deprecated Use `transitionWorktree()` for worktree state changes (Phase 2+).
 * This helper applies freeform patches without lifecycle validation.
 * It will be removed or restricted once all callers are migrated (Phase 3).
 */
export function setWorktreeState(worktreeId, patch) {
  if (!_deprecationWarned) {
    _deprecationWarned = true;
    console.warn(
      "[deprecation] setWorktreeState() is deprecated. Use transitionWorktree() instead.",
    );
  }
  return withStateLock(() => {
    const store = loadState();
    const existing = store.worktreeStates[worktreeId] || {};
    store.worktreeStates[worktreeId] = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    saveState(store);
    return store.worktreeStates[worktreeId];
  });
}
