import { TEAM_ID } from "./team-id.mjs";
import { query } from "./query.mjs";

export async function listAllOpen() {
  const OPEN = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review"];
  const allNodes = [];
  let cursor = null;
  let hasMore = true;
  while (hasMore) {
    const result = await query(
      `query($filter: IssueFilter!, $after: String) {
        issues(filter: $filter, first: 50, after: $after) {
          nodes { id identifier title description state { name } labels { nodes { id name } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { filter: { team: { id: { eq: TEAM_ID } }, state: { name: { in: OPEN } } }, after: cursor },
    );
    allNodes.push(...result.issues.nodes);
    hasMore = result.issues.pageInfo.hasNextPage;
    cursor = result.issues.pageInfo.endCursor;
  }
  return allNodes;
}
