import { getIssueState } from "./get-issue-state.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";

// Finalization states that require sticky repair by the owning worktree.
// The scheduler must not claim these — only the runner's getNextRepairableIssueForWorktree
// picks them up, ensuring the same worktree continues the repair with its dirty tree.
const STICKY_REPAIR_STATES = new Set([
  "validation_failed_repairable",
  "commit_failed_repairable",
  "branch_push_failed_repairable",
  "integration_failed_repairable",
]);

export function canExecuteIssue(issue, now = Date.now()) {
  const record = getIssueState(issue.identifier);
  if (record.human_only) return false;
  if (record.retry_exhausted) return false;
  if (record.blocked_reason) return false;
  if (record.cooldown_until && new Date(record.cooldown_until).getTime() > now) return false;
  if (leaseIsActive(record, now)) return false;
  if (issue.title?.includes("[HUMAN]")) return false;
  // Issues in sticky repair need to be picked up by their owning worktree runner,
  // not claimed by the scheduler — the scheduler cannot supply the dirty working tree.
  // Exception: if the repair state is stale (older than the lease TTL with no active
  // lease), the dirty tree is long gone. Treat as eligible so the pipeline doesn't
  // deadlock when every Todo issue is stuck in repair state.
  if (record.finalization && STICKY_REPAIR_STATES.has(record.finalization.state)) {
    const STALE_REPAIR_MS = 25 * 60 * 1000; // 25 min — slightly longer than 20-min lease TTL
    const updatedAt = record.finalization.updatedAt
      ? new Date(record.finalization.updatedAt).getTime()
      : 0;
    const isStale = updatedAt > 0 && now - updatedAt > STALE_REPAIR_MS;
    if (!isStale) return false; // fresh repair — respect sticky ownership
    // Stale repair with no lease — dirty tree is gone, dispatch fresh
  }
  return true;
}
