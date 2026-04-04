// Generated from ../../../scripts/ops/lib/service-restart-notify.mjs:81

import { sendDiscordEmbed } from "../../integrations/notifications/openclaw-discord.mjs";
import { updateMemory } from "../update-memory.mjs";

import { WORKTREE_ID } from "./worktree-id.mjs";
import { getCommitHash } from "./get-commit-hash.mjs";
import { getCommitInfo } from "./get-commit-info.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function notifyServiceRestart({
  serviceName,
  port = null,
  metadata = {},
  cwd = process.cwd(),
}) {
  try {
    const commitHash = getCommitHash(cwd);
    const commitInfo = getCommitInfo(cwd);

    logInfo(
      `📢 Sending ${serviceName} restart notification (PID ${process.pid}, commit ${commitHash})...`,
    );

    const fields = [
      { name: "Worktree", value: WORKTREE_ID, inline: true },
      { name: "PID", value: String(process.pid), inline: true },
      { name: "Commit", value: `${commitHash}: ${commitInfo.subject}`, inline: false },
    ];

    if (port) {
      fields.splice(1, 0, { name: "Port", value: String(port), inline: true });
    }

    // Add metadata fields
    for (const [key, value] of Object.entries(metadata)) {
      fields.push({
        name: key,
        value: String(value),
        inline: true,
      });
    }

    // Add commit body if present
    if (commitInfo.body && commitInfo.body.length > 0) {
      const truncatedBody =
        commitInfo.body.length > 1000 ? commitInfo.body.slice(0, 997) + "..." : commitInfo.body;
      fields.push({ name: "Details", value: truncatedBody, inline: false });
    }

    const discordResult = await sendDiscordEmbed({
      title: `🚀 ${serviceName} Started | ${WORKTREE_ID}`,
      description: `PID ${process.pid}`,
      color: 0x00ff00, // Green
      fields,
    });

    if (discordResult.sent) {
      logInfo(`✅ ${serviceName} restart notification sent successfully`);
    } else {
      logError(
        `❌ ${serviceName} restart notification failed: ${discordResult.reason || "unknown"}`,
      );
    }

    // Log runtime event - SONAR S4624: Extract nested template literal
    const metadataStr = Object.entries(metadata)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const metadataSuffix = metadataStr ? `, ${metadataStr}` : "";
    const memoryNote =
      serviceName +
      " restarted successfully (PID " +
      process.pid +
      ", commit " +
      commitHash +
      metadataSuffix +
      ")";
    await updateMemory(memoryNote, cwd);
  } catch (err) {
    logError(`❌ Failed to send ${serviceName} restart notification: ${err.message}`);
  }
}
