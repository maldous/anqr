import { createDiscordLabel } from "./create-discord-label.mjs";
import { getAllLabels } from "./get-all-labels.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
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
