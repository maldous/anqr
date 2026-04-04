import { query, TEAM_ID } from "../linear-client.mjs";

export async function createDiscordLabel() {
  const result = await query(
    `mutation($input: IssueLabelCreateInput!) {
      issueLabelCreate(input: $input) {
        success
        issueLabel {
          id
          name
          description
          color
        }
      }
    }`,
    {
      input: {
        teamId: TEAM_ID,
        name: "source:discord",
        description: "Issue created from Discord via OpenClaw Gateway",
        color: "#7289da", // Discord brand color
      },
    },
  );

  if (!result.issueLabelCreate.success) {
    throw new Error("Failed to create Discord label");
  }

  return result.issueLabelCreate.issueLabel;
}
