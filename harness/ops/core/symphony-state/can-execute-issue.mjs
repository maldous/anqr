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
  if (record.finalization && STICKY_REPAIR_STATES.has(record.finalization.state)) return false;
  return true;
}
