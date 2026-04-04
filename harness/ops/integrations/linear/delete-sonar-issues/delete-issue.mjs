// Generated from ../../../../scripts/ops/integrations/linear/delete-sonar-issues.mjs:12

import { query } from "../linear-client.mjs";

export async function deleteIssue(issueId) {
  const result = await query(
    `mutation($id: String!) {
      issueDelete(id: $id) {
        success
      }
    }`,
    { id: issueId },
  );
  if (!result.issueDelete.success) {
    throw new Error(`Failed to delete issue ${issueId}`);
  }
  return result.issueDelete.success;
}
