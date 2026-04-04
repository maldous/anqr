import { loadState } from "./load-state.mjs";

export function getWorktreeState(worktreeId) {
  const store = loadState();
  return store.worktreeStates[worktreeId] || null;
}
