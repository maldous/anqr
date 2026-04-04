// Generated from ../../../scripts/ops/core/symphony-state.mjs:700

import { loadState } from "./load-state.mjs";

export function getFleetSnapshot() {
  const store = loadState();
  const snapshot = {
    worktrees: {},
    summary: { available: 0, executing: 0, dirty: 0, quarantined: 0, blocked: 0, unknown: 0 },
    timestamp: new Date().toISOString(),
  };
  for (const [id, wt] of Object.entries(store.worktreeStates)) {
    snapshot.worktrees[id] = wt;
    const bucket =
      wt.state === "dirty_owned" || wt.state === "dirty_orphaned"
        ? "dirty"
        : snapshot.summary[wt.state] !== undefined
          ? wt.state
          : "unknown";
    snapshot.summary[bucket] = (snapshot.summary[bucket] || 0) + 1;
  }
  return snapshot;
}
