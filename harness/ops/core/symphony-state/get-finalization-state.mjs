import { getIssueState } from "./get-issue-state.mjs";

export function getFinalizationState(issueIdentifier) {
  const record = getIssueState(issueIdentifier);
  return record.finalization || null;
}
