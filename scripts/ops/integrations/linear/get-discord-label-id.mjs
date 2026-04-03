#!/usr/bin/env node

/**
 * get-discord-label-id.mjs - Find or create the Discord label in Linear
 *
 * This script queries Linear for a label named "source:discord" and outputs
 * the DISCORD_LABEL_ID value to be added to anqr-ops.env.
 *
 * Usage:
 *   node scripts/ops/integrations/linear/get-discord-label-id.mjs
 */

import { query, TEAM_ID } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logError } = createLogger();

async function getAllLabels() {
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

async function createDiscordLabel() {
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

async function main() {
  try {
    logInfo("🔍 Searching for Discord label in Linear workspace...");

    const labels = await getAllLabels();
    const discordLabel = labels.find(
      (l) => l.name === "source:discord" || l.name.toLowerCase().includes("discord"),
    );

    if (discordLabel) {
      logInfo(`✅ Found Discord label: ${discordLabel.name} (${discordLabel.id})`);
      logInfo("\nAdd this to your ~/.config/systemd/user/anqr-ops.env:");
      logInfo(`DISCORD_LABEL_ID=${discordLabel.id}`);
      logInfo("");
      return;
    }

    logInfo("⚠️  No Discord label found. Creating one...");
    const newLabel = await createDiscordLabel();
    logInfo(`✅ Created Discord label: ${newLabel.name} (${newLabel.id})`);
    logInfo("\nAdd this to your ~/.config/systemd/user/anqr-ops.env:");
    logInfo(`DISCORD_LABEL_ID=${newLabel.id}`);
    logInfo("");
    logInfo("Then reload systemd and restart services:");
    logInfo("  systemctl --user daemon-reload");
    logInfo("  systemctl --user restart anqr-linear-webhook anqr-queue-feeder");
  } catch (err) {
    logError(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
