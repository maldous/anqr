// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:142

import { query, TEAM_ID } from "../../linear/linear-client.mjs";

import { OPEN_STATE_NAMES } from "./open-state-names.mjs";

export async function findOpenLinearIssuesByTag(titleTag) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 100) {
        nodes {
          id identifier title description priority
          state { name }
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        state: { name: { in: OPEN_STATE_NAMES } },
        title: { contains: titleTag },
      },
    },
  );
  return result.issues.nodes;
}
