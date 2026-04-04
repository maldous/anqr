// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:197

import { updateIssue } from "./update-issue.mjs";

export async function applyLabels(issueId, labelIds) {
  return updateIssue(issueId, { labelIds });
}
