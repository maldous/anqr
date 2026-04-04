// Generated from ../../../scripts/ops/core/symphony-state.mjs:672

import { loadState } from "./load-state.mjs";

export function listWorktreesByState(state) {
  const store = loadState();
  return Object.entries(store.worktreeStates)
    .filter(([, wt]) => wt.state === state)
    .map(([id, wt]) => ({ worktreeId: id, ...wt }));
}
