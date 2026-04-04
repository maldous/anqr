import { getIssueDetail } from "./get-issue-detail.mjs";

export async function findOpenIssuesByIdentifier(identifier) {
  // Use getIssueDetail which correctly queries via issue(id: $id)
  // Linear's IssueFilter doesn't support "identifier" field, only "id"
  const issue = await getIssueDetail(identifier);
  return issue ? [issue] : [];
}
