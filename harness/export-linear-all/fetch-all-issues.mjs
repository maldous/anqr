// Generated from ../scripts/export-linear-all.mjs:18

import { query, TEAM_ID } from "../ops/integrations/linear/linear-client.mjs";

export async function fetchAllIssues() {
  const allNodes = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const result = await query(
      `query($filter: IssueFilter!, $after: String) {
        issues(filter: $filter, first: 50, after: $after) {
          nodes {
            id
            identifier
            title
            description
            priority
            state { name }
            labels { nodes { id name } }
            comments(first: 100) {
              nodes {
                id
                body
                createdAt
                updatedAt
              }
            }
            createdAt
            updatedAt
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      {
        filter: {
          team: { id: { eq: TEAM_ID } },
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
