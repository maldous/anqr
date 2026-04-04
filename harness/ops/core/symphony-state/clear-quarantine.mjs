// Generated from ../../../scripts/ops/core/symphony-state.mjs:689

import { setWorktreeState } from "./set-worktree-state.mjs";

export function clearQuarantine(worktreeId) {
  return setWorktreeState(worktreeId, {
    state: "available",
    issueIdentifier: null,
    reason: null,
    quarantinedAt: null,
    repairAttempts: 0,
    lastError: null,
  });
}
