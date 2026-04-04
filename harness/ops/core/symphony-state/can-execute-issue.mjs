// Generated from ../../../scripts/ops/core/symphony-state.mjs:265

import { getIssueState } from "./get-issue-state.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";

export function canExecuteIssue(issue, now = Date.now()) {
  const record = getIssueState(issue.identifier);
  if (record.human_only) return false;
  if (record.retry_exhausted) return false;
  if (record.blocked_reason) return false;
  if (record.cooldown_until && new Date(record.cooldown_until).getTime() > now) return false;
  if (leaseIsActive(record, now)) return false;
  if (issue.title?.includes("[HUMAN]")) return false;
  return true;
}
