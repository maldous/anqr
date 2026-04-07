// Extracted from runtime.mjs: Discord startup notification with git commit info.

import { execSync } from "node:child_process";
import { sendDiscordEmbed } from "../../notifications/openclaw-discord.mjs";
import { PORT } from "./port.mjs";
import { MODEL_ID } from "./model-id.mjs";
import { voiceAnnounce } from "./voice-announce.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function sendStartupDiscordNotification() {
  const startupWorktreeId = process.env.ANQR_WORKTREE_ID;
  const shouldAnnounceStartup = !startupWorktreeId || startupWorktreeId === "wt1";
  try {
    const commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const commitInfo = execSync('git log -1 --pretty=format:"%s%n%b"', {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const [commitSubject, ...commitBodyLines] = commitInfo.split("\n");
    const commitBody = commitBodyLines.join("\n").trim();

    logInfo(
      `📢 Sending Discord startup notification (PID ${process.pid}, commit ${commitHash})...`,
    );

    const fields = [
      { name: "Port", value: String(PORT), inline: true },
      { name: "Model", value: MODEL_ID, inline: true },
      { name: "Commit", value: `${commitHash}: ${commitSubject}`, inline: false },
    ];

    // Add commit body if present (truncate to Discord field limit of 1024 chars)
    if (commitBody && commitBody.length > 0) {
      const truncatedBody =
        commitBody.length > 1000 ? commitBody.slice(0, 997) + "..." : commitBody;
      fields.push({ name: "Details", value: truncatedBody, inline: false });
    }

    if (shouldAnnounceStartup) {
      const discordResult = await sendDiscordEmbed({
        title: "🔄 Symphony Bridge Restarted",
        description: `PID ${process.pid}`,
        color: 0x00ff00, // Green
        fields,
        threadName: "System Status",
      });
      if (discordResult.sent) {
        logInfo(`✅ Discord restart notification sent successfully`);
      } else {
        logError(`❌ Discord restart notification failed: ${discordResult.reason || "unknown"}`);
      }

      voiceAnnounce("Symphony bridge is online.");
    } else {
      logInfo(`Skipping startup notification (${startupWorktreeId} — wt1 announces for all)`);
    }
  } catch (err) {
    logError(`❌ Failed to send Discord restart notification: ${err.message}`);
  }
}
