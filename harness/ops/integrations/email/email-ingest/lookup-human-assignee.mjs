import { query, TEAM_ID } from "../../../linear-client.mjs";

import { HUMAN_USER_NAME } from "./human-user-name.mjs";

export async function lookupHumanAssignee() {
  try {
    const teamData = await query(
      `query($teamId: String!) {
        team(id: $teamId) {
          members(first: 50) { nodes { id name active } }
        }
      }`,
      { teamId: TEAM_ID },
    );
    const member = teamData.team?.members?.nodes?.find(
      (m) => m.active && m.name === HUMAN_USER_NAME,
    );
    return member?.id || null;
  } catch {
    return null;
  }
}
