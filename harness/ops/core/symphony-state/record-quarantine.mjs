// Generated from ../../../scripts/ops/core/symphony-state.mjs:679

import { setWorktreeState } from "./set-worktree-state.mjs";

export function recordQuarantine(worktreeId, details = {}) {
  return setWorktreeState(worktreeId, {
    state: "quarantined",
    reason: details.reason || "unknown",
    quarantinedAt: new Date().toISOString(),
    repairAttempts: details.repairAttempts || 0,
    lastError: details.lastError || null,
  });
}
