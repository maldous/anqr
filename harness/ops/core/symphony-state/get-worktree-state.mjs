// Generated from ../../../scripts/ops/core/symphony-state.mjs:667

import { loadState } from "./load-state.mjs";

export function getWorktreeState(worktreeId) {
  const store = loadState();
  return store.worktreeStates[worktreeId] || null;
}
