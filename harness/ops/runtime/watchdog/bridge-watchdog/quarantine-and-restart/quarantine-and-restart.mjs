import { createOrUpdateIncident } from "../../../../integrations/linear/incident-manager.mjs";
import { sendDiscordEmbed } from "../../../../integrations/notifications/openclaw-discord.mjs";
import { execSync } from "node:child_process";

import { WORKTREE_ID } from "../worktree-id.mjs";
import { getCurrentCommit } from "../get-current-commit.mjs";
import { isInCooldown } from "../is-in-cooldown.mjs";
import { lastRecoveryAction } from "../last-recovery-action.mjs";
import { trackWatchdogTrigger } from "../track-watchdog-trigger.mjs";
import { updateMemory } from "../update-memory.mjs";
import { logInfo, logError } from "../logger.mjs";
import { writeEvidenceRecord } from "./write-evidence-record.mjs";

export async function quarantineAndRestart(serviceName, shortName, reason) {
  await trackWatchdogTrigger(serviceName, reason);

  try {
    await createOrUpdateIncident({
      type: "WATCHDOG_INTERVENTION",
      service: shortName,
      trigger: reason,
    });
  } catch (err) {
    logError(`[watchdog] ⚠️ Failed to create incident: ${err.message}`);
  }

  if (isInCooldown(serviceName)) {
    logInfo(`[watchdog] ⏭️ Skipping intervention for ${shortName} - in cooldown period`);
    return false;
  }

  const currentCommit = getCurrentCommit();

  logInfo(`[watchdog] 🔄 Quarantining and restarting ${shortName}`);
  logInfo(`[watchdog]    Reason: ${reason}`);
  logInfo(`[watchdog]    Commit: ${currentCommit || "unknown"}`);

  writeEvidenceRecord(serviceName, shortName, reason, currentCommit);

  try {
    await sendDiscordEmbed({
      title: `🚨 WATCHDOG INTERVENTION | ${WORKTREE_ID}`,
      description: `**${shortName.toUpperCase()} SERVICE UNHEALTHY**\n\nRestarting service (no git rollback — safe mode).`,
      color: 0xff9900,
      fields: [
        { name: "Worktree", value: WORKTREE_ID, inline: true },
        { name: "Service", value: serviceName, inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Commit", value: `\`${currentCommit || "unknown"}\``, inline: true },
        { name: "Action", value: "Restart (no rollback)", inline: true },
      ],
      footer: "Watchdog safe mode — no destructive git operations",
      threadName: "ANQR",
    });
  } catch (err) {
    logError(`[watchdog] ⚠️ Failed to send intervention alert: ${err.message}`);
  }

  try {
    logInfo(`[watchdog]    Stopping ${serviceName}...`);
    execSync(`systemctl --user stop ${serviceName}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    logInfo(``);
    logInfo(`[watchdog] ════════════════════════════════════════════════════════════════`);
    logInfo(`[watchdog] 🔄 RESTARTING ${shortName.toUpperCase()} SERVICE`);
    logInfo(`[watchdog]    Service: ${serviceName}`);
    logInfo(`[watchdog]    Reason: ${reason}`);
    logInfo(`[watchdog]    Action: Safe restart (no git rollback)`);
    logInfo(`[watchdog] ════════════════════════════════════════════════════════════════`);
    logInfo(``);

    execSync(`systemctl --user restart ${serviceName}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    lastRecoveryAction.set(serviceName, Date.now());

    await updateMemory(
      `Watchdog restarted ${shortName} service (reason: ${reason}, commit: ${currentCommit || "unknown"}, action: restart-only)`,
    );

    try {
      await sendDiscordEmbed({
        title: `✅ Restart Complete | ${WORKTREE_ID}`,
        description: `${shortName.toUpperCase()} service restarted successfully`,
        color: 0x00ff00,
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Commit", value: `\`${currentCommit || "unknown"}\``, inline: true },
          { name: "Status", value: "Service restarted", inline: true },
        ],
        footer: "Watchdog will continue monitoring",
        threadName: "ANQR",
      });
    } catch (err) {
      logError(`[watchdog] ⚠️ Failed to send restart success notification: ${err.message}`);
    }

    logInfo(`[watchdog] ✅ Restart complete for ${shortName}`);
    return true;
  } catch (err) {
    logError(`[watchdog] ❌ Restart failed for ${shortName}: ${err.message}`);

    try {
      await sendDiscordEmbed({
        title: `🚨 RESTART FAILED | ${WORKTREE_ID}`,
        description: `**CRITICAL: ${shortName.toUpperCase()} SERVICE RESTART FAILED**\n\nManual intervention required!`,
        color: 0xff0000,
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Service", value: serviceName, inline: true },
          { name: "Error", value: err.message.slice(0, 200), inline: false },
        ],
        footer: "⚠️ Manual recovery needed immediately",
        threadName: "ANQR",
      });
    } catch (error_) {
      logError(`[watchdog] ⚠️ Failed to send restart failure notification: ${error_.message}`);
    }

    await updateMemory(`Watchdog restart FAILED for ${shortName} service: ${err.message}`);
    return false;
  }
}
