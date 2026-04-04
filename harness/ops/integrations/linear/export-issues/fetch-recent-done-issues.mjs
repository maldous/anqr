import { query, TEAM_ID } from "../linear-client.mjs";

export async function fetchRecentDoneIssues(days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffISO = cutoffDate.toISOString();

  const allNodes = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const result = await query(
      `query($filter: IssueFilter!, $after: String) {
        issues(filter: $filter, first: 50, after: $after) {
          nodes {
            id identifier title description priority
            state { name }
            labels { nodes { id name } }
            createdAt updatedAt
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      {
        filter: {
          team: { id: { eq: TEAM_ID } },
          state: { name: { eq: "Done" } },
          updatedAt: { gte: cutoffISO },
        },
        after: cursor,
      },
    );
    allNodes.push(...result.issues.nodes);
    hasMore = result.issues.pageInfo.hasNextPage;
    cursor = result.issues.pageInfo.endCursor;
  }

  return allNodes;
}
