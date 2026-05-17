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
    function classifyBucket(state) {
      if (state === "dirty_owned" || state === "dirty_orphaned") return "dirty";
      if (snapshot.summary[state] === undefined) return "unknown";
      return state;
    }
    const bucket = classifyBucket(wt.state);
    snapshot.summary[bucket] = (snapshot.summary[bucket] || 0) + 1;
  }
  return snapshot;
}
