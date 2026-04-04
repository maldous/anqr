// Generated from ../../../scripts/ops/core/symphony-state.mjs:276

import { canExecuteIssue } from "./can-execute-issue.mjs";
import { getIssueState } from "./get-issue-state.mjs";

export function canFeedIssue(issue, now = Date.now()) {
  const record = getIssueState(issue.identifier);
  if (!canExecuteIssue(issue, now)) return false;
  if ((record.source || "").startsWith("email")) return false;
  return true;
}
