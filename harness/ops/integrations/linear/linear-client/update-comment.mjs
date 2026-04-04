// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:183

import { query } from "./query.mjs";

export async function updateComment(commentId, body) {
  const result = await query(
    `mutation($id: String!, $input: CommentUpdateInput!) {
      commentUpdate(id: $id, input: $input) {
        success
        comment { id body }
      }
    }`,
    { id: commentId, input: { body } },
  );
  if (!result.commentUpdate.success) throw new Error(`Failed to update comment ${commentId}`);
  return result.commentUpdate.comment;
}
