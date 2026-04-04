// Generated from ../../scripts/ops/linear-issue-review.mjs:66

import { query } from "./query.mjs";

export async function addComment(issueId, body) {
  const result = await query(
    `mutation($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) { success }
    }`,
    { issueId, body },
  );
  if (!result.commentCreate.success) throw new Error(`Failed to comment on ${issueId}`);
}
