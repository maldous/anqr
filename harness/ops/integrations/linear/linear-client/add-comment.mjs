import { query } from "./query.mjs";

export async function addComment(issueId, body) {
  const result = await query(
    `mutation($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) {
        success
        comment { id createdAt }
      }
    }`,
    { issueId, body },
  );
  if (!result.commentCreate.success) throw new Error(`Failed to add comment to ${issueId}`);
  return result.commentCreate.comment;
}
