// Generated from ../../../scripts/ops/core/symphony-state.mjs:554

import { getIssueState } from "./get-issue-state.mjs";

export function getFinalizationState(issueIdentifier) {
  const record = getIssueState(issueIdentifier);
  return record.finalization || null;
}
