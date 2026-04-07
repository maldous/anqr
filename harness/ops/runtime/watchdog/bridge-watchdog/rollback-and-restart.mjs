import { createOrUpdateIncident } from "../../../integrations/linear/incident-manager.mjs";
import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";
import { execSync } from "node:child_process";

import { WORKTREE_ID } from "./worktree-id.mjs";
import { getCurrentCommit } from "./get-current-commit.mjs";
import { getPreviousCommit } from "./get-previous-commit.mjs";
import { isInCooldown } from "./is-in-cooldown.mjs";
import { lastRecoveryAction } from "./last-recovery-action.mjs";
import { trackWatchdogTrigger } from "./track-watchdog-trigger.mjs";
import { updateMemory } from "./update-memory.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function rollbackAndRestart(serviceName, shortName, reason) {
  // Track this watchdog trigger for rate alerting
  await trackWatchdogTrigger(serviceName, reason);

  // Create incident for watchdog rollback
  try {
    await createOrUpdateIncident({
      type: "WATCHDOG_ROLLBACK",
      service: shortName,
      trigger: reason,
    });
  } catch (err) {
    logError(`[watchdog] ⚠️ Failed to create incident: ${err.message}`);
  }

  // Check cooldown
  if (isInCooldown(serviceName)) {
    logInfo(`[watchdog] ⏭️ Skipping rollback for ${shortName} - in cooldown period`);
    return false;
  }

  const currentCommit = getCurrentCommit();
  const previousCommit = getPreviousCommit();

  if (!currentCommit || !previousCommit) {
    logError(`[watchdog] ❌ Cannot rollback ${shortName}: failed to get commit info`);
    return false;
  }

  logInfo(`[watchdog] 🔄 Rolling back ${shortName} from ${currentCommit} to ${previousCommit}`);
  logInfo(`[watchdog]    Reason: ${reason}`);

  // Send immediate Discord alert about rollback
  try {
    await sendDiscordEmbed({
      title: `🚨 WATCHDOG ROLLBACK | ${WORKTREE_ID}`,
      description: `**${shortName.toUpperCase()} BRIDGE FAILED TO START**\n\nAutomatic rollback in progress...`,
      color: 0xff0000, // Red
      fields: [
        { name: "Worktree", value: WORKTREE_ID, inline: true },
        { name: "Service", value: serviceName, inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Failed Commit", value: `\`${currentCommit}\``, inline: true },
        { name: "Rolling Back To", value: `\`${previousCommit}\``, inline: true },
      ],
      footer: "⚠️ Review the failed commit before attempting fixes",
      threadName: "ANQR",
    });
  } catch (err) {
    logError(`[watchdog] ⚠️ Failed to send rollback alert: ${err.message}`);
  }

  try {
    // 1. Stop the service
    logInfo(`[watchdog]    Stopping ${serviceName}...`);
    execSync(`systemctl --user stop ${serviceName}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    // 2. Rollback git
    logInfo(`[watchdog]    Rolling back to ${previousCommit}...`);
    execSync(`git reset --hard ${previousCommit}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    // 3. Restart the service
    logInfo(``);
    logInfo(`[watchdog] ════════════════════════════════════════════════════════════════`);
    logInfo(`[watchdog] 🔄 RESTARTING ${shortName.toUpperCase()} BRIDGE SERVICE`);
    logInfo(`[watchdog]    Service: ${serviceName}`);
    logInfo(`[watchdog]    Reason: Rollback recovery from ${currentCommit} to ${previousCommit}`);
    logInfo(`[watchdog] ════════════════════════════════════════════════════════════════`);
    logInfo(``);

    execSync(`systemctl --user restart ${serviceName}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    // Record recovery action with timestamp
    lastRecoveryAction.set(serviceName, Date.now());

    // 4. Update MEMORY.md with detailed banner
    const memoryBanner = [
      `╔════════════════════════════════════════════════════════════════╗`,
      `║ 🚨 WATCHDOG AUTOMATIC ROLLBACK 🚨                              ║`,
      `╠════════════════════════════════════════════════════════════════╣`,
      `║ Service:        ${shortName.slice(0, 47).padEnd(47)} ║`,
      `║ Failed Commit:  ${currentCommit.slice(0, 47).padEnd(47)} ║`,
      `║ Rolled Back To: ${previousCommit.slice(0, 47).padEnd(47)} ║`,
      `║ Reason:         ${reason.slice(0, 47).padEnd(47)} ║`,
      `╠════════════════════════════════════════════════════════════════╣`,
      `║ ⚠️  REVIEW THE FAILED COMMIT BEFORE MAKING NEW CHANGES         ║`,
      `╚════════════════════════════════════════════════════════════════╝`,
    ].join("\n");

    await updateMemory(
      `Watchdog rolled back ${shortName} bridge from ${currentCommit} to ${previousCommit} (${reason})\n\n${memoryBanner}`,
    );

    // Send Discord success notification
    try {
      await sendDiscordEmbed({
        title: `✅ Rollback Complete | ${WORKTREE_ID}`,
        description: `${shortName.toUpperCase()} bridge successfully rolled back and restarted`,
        color: 0x00ff00, // Green
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Previous Commit", value: `\`${previousCommit}\``, inline: true },
          { name: "Status", value: "Service restarted", inline: true },
        ],
        footer: "Watchdog will continue monitoring",
        threadName: "ANQR",
      });
    } catch (err) {
      logError(`[watchdog] ⚠️ Failed to send rollback success notification: ${err.message}`);
    }

    logInfo(`[watchdog] ✅ Rollback complete for ${shortName}`);
    return true;
  } catch (err) {
    logError(`[watchdog] ❌ Rollback failed for ${shortName}: ${err.message}`);

    // Send critical failure notification
    try {
      await sendDiscordEmbed({
        title: `🚨 ROLLBACK FAILED | ${WORKTREE_ID}`,
        description: `**CRITICAL: ${shortName.toUpperCase()} BRIDGE ROLLBACK FAILED**\n\nManual intervention required!`,
        color: 0xff0000, // Red
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Service", value: serviceName, inline: true },
          { name: "Error", value: err.message.slice(0, 200), inline: false },
        ],
        footer: "⚠️ Manual recovery needed immediately",
        threadName: "ANQR",
      });
    } catch (error_) {
      logError(`[watchdog] ⚠️ Failed to send rollback failure notification: ${error_.message}`);
    }

    await updateMemory(`Watchdog rollback FAILED for ${shortName} bridge: ${err.message}`);
    return false;
  }
}
