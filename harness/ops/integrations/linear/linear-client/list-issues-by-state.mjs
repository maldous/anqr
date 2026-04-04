// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:135

import { TEAM_ID } from "./team-id.mjs";
import { query } from "./query.mjs";

export async function listIssuesByState(stateNames) {
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
          state: { name: { in: stateNames } },
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
