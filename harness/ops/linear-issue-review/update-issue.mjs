// Generated from ../../scripts/ops/linear-issue-review.mjs:55

import { query } from "./query.mjs";

export async function updateIssue(issueId, input) {
  const result = await query(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { id identifier title state { name } } }
    }`,
    { id: issueId, input },
  );
  if (!result.issueUpdate.success) throw new Error(`Failed to update ${issueId}`);
  return result.issueUpdate.issue;
}
