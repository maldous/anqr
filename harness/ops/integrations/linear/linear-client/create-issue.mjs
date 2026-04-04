import { TEAM_ID } from "./team-id.mjs";
import { query } from "./query.mjs";

export async function createIssue(input) {
  const result = await query(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title description priority estimate state { name } labels { nodes { name } } }
      }
    }`,
    { input: { teamId: TEAM_ID, ...input } },
  );
  if (!result.issueCreate.success) throw new Error("Failed to create issue");
  return result.issueCreate.issue;
}
