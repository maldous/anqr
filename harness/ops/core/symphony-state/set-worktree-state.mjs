// Generated from ../../../scripts/ops/core/symphony-state.mjs:653

import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function setWorktreeState(worktreeId, patch) {
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
