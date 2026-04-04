import { createIssue, STATES, LABELS } from "../../linear/linear-client.mjs";

import { CONSOLIDATED_ISSUE_TITLE } from "./consolidated-issue-title.mjs";
import { logInfo } from "./logger.mjs";

export async function findOrCreateConsolidatedIssue(existingIssues) {
  if (existingIssues.length > 0) {
    return existingIssues[0];
  }
  // No existing consolidated issue - create one
  const issue = await createIssue({
    title: CONSOLIDATED_ISSUE_TITLE,
    description: "Placeholder - will be updated after findings are enumerated",
    priority: 1,
    labelIds: [LABELS.harness],
    stateId: STATES.todo,
  });
  logInfo(`[sonar-audit] Created consolidated issue: ${issue.identifier}`);
  return issue;
}
