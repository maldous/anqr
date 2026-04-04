import { query } from "./query.mjs";

export async function updateIssue(issueId, input) {
  const result = await query(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier title description priority estimate state { name } labels { nodes { id name } } }
      }
    }`,
    { id: issueId, input },
  );
  if (!result.issueUpdate.success) throw new Error(`Failed to update issue ${issueId}`);
  return result.issueUpdate.issue;
}
