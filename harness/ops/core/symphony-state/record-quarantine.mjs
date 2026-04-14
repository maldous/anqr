import { transitionWorktree } from "./transition-worktree.mjs";

export function recordQuarantine(worktreeId, details = {}) {
  return transitionWorktree(worktreeId, "quarantined", {
    reason: details.reason || "unknown",
    quarantinedAt: new Date().toISOString(),
    repairAttempts: details.repairAttempts || 0,
    lastError: details.lastError || null,
  });
}
