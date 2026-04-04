import { canExecuteIssue } from "../../../symphony-state.mjs";

import { listIssuesByState } from "./list-issues-by-state.mjs";

export async function getQueueDepth() {
  const activeStates = ["Todo", "In Progress"];
  const issues = await listIssuesByState(activeStates);
  const automatable = issues.filter((i) => canExecuteIssue(i));
  return { total: issues.length, automatable: automatable.length, issues: automatable };
}
