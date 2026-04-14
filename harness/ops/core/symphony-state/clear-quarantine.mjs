import { transitionWorktree } from "./transition-worktree.mjs";

export function clearQuarantine(worktreeId) {
  return transitionWorktree(worktreeId, "available", {
    assignedIssue: null,
    reason: null,
    quarantinedAt: null,
    repairAttempts: 0,
    lastError: null,
  });
}
