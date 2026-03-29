/**
 * service-restart-notify.mjs — Reusable utility for service restart notifications
 *
 * Provides consistent restart/shutdown notifications for all services:
 * - Discord webhook notifications with service status
 * - Runtime event logging to reports/runtime-events.log (gitignored)
 * - Consistent formatting and metadata
 *
 * Note: MEMORY.md is reserved for human-curated summaries only (updated via Linear issues).
 *
 * Usage:
 *   import { notifyServiceRestart, notifyServiceShutdown } from './service-restart-notify.mjs';
 *
 *   // On startup
 *   await notifyServiceRestart({
 *     serviceName: 'Symphony Bridge',
 *     port: 4319,
 *     metadata: { providers: '38/38 available', model: 'symphony/main' }
 *   });
 *
 *   // On shutdown
 *   await notifyServiceShutdown({
 *     serviceName: 'OpenClaw Gateway',
 *     signal: 'SIGTERM',
 *     metadata: { port: 18789, activeConnections: 5 }
 *   });
 */

import { execSync } from "node:child_process";
import { sendDiscordEmbed } from "../integrations/notifications/discord-webhook.mjs";
import { updateMemory } from "./update-memory.mjs";
import { createLogger } from "./logger.mjs";

const { logInfo, logError } = createLogger();

/**
 * Get current git commit hash
 */
function getCommitHash(cwd = process.cwd()) {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd,
      timeout: 5000,
    }).trim();
  } catch (err) {
    logError(`Failed to get commit hash: ${err.message}`);
    return "unknown";
  }
}

/**
 * Get current git commit message
 */
function getCommitInfo(cwd = process.cwd()) {
  try {
    const info = execSync('git log -1 --pretty=format:"%s%n%b"', {
      encoding: "utf-8",
      cwd,
      timeout: 5000,
    }).trim();
    const [subject, ...bodyLines] = info.split("\n");
    const body = bodyLines.join("\n").trim();
    return { subject, body };
  } catch {
    return { subject: "unknown", body: "" };
  }
}

/**
 * Send Discord notification for service restart/startup
 *
 * @param {object} options
 * @param {string} options.serviceName - Human-readable service name (e.g., "Symphony Bridge", "OpenClaw Gateway")
 * @param {number} [options.port] - Service port number
 * @param {object} [options.metadata] - Additional metadata to include (e.g., providers, model, mode)
 * @param {string} [options.cwd] - Working directory for git commands
 * @returns {Promise<void>}
 */
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
      { name: "PID", value: String(process.pid), inline: true },
      { name: "Commit", value: `${commitHash}: ${commitInfo.subject}`, inline: false },
    ];

    if (port) {
      fields.unshift({ name: "Port", value: String(port), inline: true });
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
      title: `🚀 ${serviceName} Started`,
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

/**
 * Send Discord notification for service shutdown
 *
 * @param {object} options
 * @param {string} options.serviceName - Human-readable service name (e.g., "Symphony Bridge", "OpenClaw Gateway")
 * @param {string} options.signal - Signal that triggered shutdown (e.g., "SIGTERM", "SIGINT")
 * @param {object} [options.metadata] - Additional metadata to include (e.g., activeConnections, providers)
 * @param {number} [options.activeRequests] - Number of active requests being terminated
 * @param {string} [options.cwd] - Working directory for git commands
 * @returns {Promise<void>}
 */
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
      title: `⚠️ ${serviceName} Restarting`,
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
