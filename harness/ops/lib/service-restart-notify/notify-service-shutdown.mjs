import { sendDiscordEmbed } from "../../integrations/notifications/openclaw-discord.mjs";
import { updateMemory } from "../update-memory.mjs";

import { WORKTREE_ID } from "./worktree-id.mjs";
import { getCommitHash } from "./get-commit-hash.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function notifyServiceShutdown({
  serviceName,
  signal,
  metadata = {},
  activeRequests = 0,
  cwd = process.cwd(),
}) {
  try {
    const commitHash = getCommitHash(cwd);

    logInfo(`📢 Sending ${serviceName} shutdown notification...`);

    const fields = [
      { name: "Worktree", value: WORKTREE_ID, inline: true },
      { name: "Signal", value: signal, inline: true },
      { name: "PID", value: String(process.pid), inline: true },
      { name: "Commit", value: commitHash, inline: true },
    ];

    // Add metadata fields
    for (const [key, value] of Object.entries(metadata)) {
      fields.push({
        name: key,
        value: String(value),
        inline: true,
      });
    }

    // Add active requests warning if present
    if (activeRequests > 0) {
      fields.push({
        name: "Active Requests",
        value: `⚠️ ${activeRequests} in-flight`,
        inline: true,
      });
    }

    await sendDiscordEmbed({
      title: `⚠️ ${serviceName} Restarting | ${WORKTREE_ID}`,
      description: `**Service interruption in progress**\n\nThe service is shutting down and will restart momentarily.`,
      color: 0xffa500, // Orange - warning color
      fields,
      footer:
        activeRequests > 0
          ? "⚠️ Active requests will be terminated"
          : "Service will resume shortly",
    });

    logInfo(`📢 Sent ${serviceName} shutdown notification`);

    // Log runtime event - SONAR S4624: Extract nested template literal
    const metadataStr = Object.entries(metadata)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const metadataSuffix = metadataStr ? `, ${metadataStr}` : "";
    const memoryNote =
      serviceName +
      " stopped (PID " +
      process.pid +
      ", commit " +
      commitHash +
      metadataSuffix +
      ", signal: " +
      signal +
      ")";
    await updateMemory(memoryNote, cwd);
    logInfo(`📝 Logged runtime event before shutdown`);
  } catch (err) {
    logError(`⚠️ Failed to send ${serviceName} shutdown notification: ${err.message}`);
  }
}
