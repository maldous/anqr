// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:97

import { OPEN_STATE_NAMES } from "./open-state-names.mjs";
import { TEAM_ID } from "./team-id.mjs";
import { query } from "./query.mjs";

export async function findOpenIssues(filterExtras) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 100) {
        nodes {
          id identifier title description priority estimate
          state { name }
          labels { nodes { id name } }
          createdAt updatedAt
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        state: { name: { in: OPEN_STATE_NAMES } },
        ...filterExtras,
      },
    },
  );
  return result.issues.nodes;
}
