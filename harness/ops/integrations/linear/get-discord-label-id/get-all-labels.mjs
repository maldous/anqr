// Generated from ../../../../scripts/ops/integrations/linear/get-discord-label-id.mjs:18

import { query, TEAM_ID } from "../linear-client.mjs";

export async function getAllLabels() {
  const result = await query(
    `query($teamId: String!) {
      team(id: $teamId) {
        labels {
          nodes {
            id
            name
            description
            color
          }
        }
      }
    }`,
    { teamId: TEAM_ID },
  );
  return result.team.labels.nodes;
}
