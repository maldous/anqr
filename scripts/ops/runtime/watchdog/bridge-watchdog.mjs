#!/usr/bin/env node

/**
 * bridge-watchdog.mjs — Watchdog for Symphony and Codebuff bridges
 *
 * Monitors both bridges and automatically rolls back to previous git commit
 * if either service fails to start within 60 seconds after a restart.
 *
 * Features:
 *   - Monitors systemd service status every 60 seconds
 *   - Detects failed starts (service stuck in "activating" or "failed")
 *   - Automatically rolls back to previous commit on failure
 *   - Restarts failed services after rollback
 *   - Updates MEMORY.md with rollback events
 *
 * Environment:
 *   WATCHDOG_CHECK_INTERVAL — Check interval in seconds (default: 60)
 */

import { execSync } from "node:child_process";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import { sendDiscordEmbed } from "../../integrations/notifications/discord-webhook.mjs";

const CHECK_INTERVAL_MS = (parseInt(process.env.WATCHDOG_CHECK_INTERVAL) || 60) * 1000;
const STARTUP_GRACE_PERIOD_MS = 60 * 1000; // 60 seconds grace period for startup

const MONITORED_SERVICES = [
  { name: "anqr-symphony-bridge.service", shortName: "symphony" },
  { name: "anqr-codebuff-bridge.service", shortName: "codebuff" },
];

// Track restart timestamps and activating state
const restartTimestamps = new Map();
const activatingStateStart = new Map();

async function updateMemory(note) {
  const timestamp = new Date().toISOString();
  const entry = `\n### ${timestamp} - ${note}\n`;
  try {
    await appendFile(path.join(process.cwd(), "MEMORY.md"), entry);
    console.log(`[watchdog] 📝 Updated MEMORY.md: ${note}`);
  } catch (err) {
    console.log(`[watchdog] ⚠️ Failed to update MEMORY.md: ${err.message}`);
  }
}

function getServiceStatus(serviceName) {
  try {
    const output = execSync(
      `systemctl --user is-active ${serviceName} 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    return output.trim();
  } catch {
    return "unknown";
  }
}

function getServicePID(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=MainPID --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const pid = parseInt(output.trim());
    return pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function getServiceActiveTime(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=ActiveEnterTimestamp --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 }
    );
    const timestamp = output.trim();
    if (!timestamp || timestamp === "0") return null;
    return new Date(timestamp);
  } catch {
    return null;
  }
}

function getCurrentCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 5000,
    }).trim();
  } catch (err) {
    console.error(`[watchdog] Failed to get current commit: ${err.message}`);
    return null;
  }
}

function getPreviousCommit() {
  try {
    return execSync("git rev-parse --short HEAD~1", {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 5000,
    }).trim();
  } catch (err) {
    console.error(`[watchdog] Failed to get previous commit: ${err.message}`);
    return null;
  }
}

async function verifyAndNotifyRecovery(serviceName, shortName) {
  await new Promise(resolve => setTimeout(resolve, 5000));
  const recoveryStatus = getServiceStatus(serviceName);
  if (recoveryStatus === "active") {
    try {
      await sendDiscordEmbed({
        title: "🎉 Recovery Successful",
        description: `${shortName.toUpperCase()} bridge is now healthy after rollback`,
        color: 0x00FF00, // Green
        fields: [
          { name: "Service", value: serviceName, inline: true },
          { name: "Status", value: "Active", inline: true },
        ],
      });
    } catch (err) {
      console.error(`[watchdog] ⚠️ Failed to send recovery notification: ${err.message}`);
    }
  }
}

async function rollbackAndRestart(serviceName, shortName, reason) {
  const currentCommit = getCurrentCommit();
  const previousCommit = getPreviousCommit();

  if (!currentCommit || !previousCommit) {
    console.error(`[watchdog] ❌ Cannot rollback ${shortName}: failed to get commit info`);
    return false;
  }

  console.log(`[watchdog] 🔄 Rolling back ${shortName} from ${currentCommit} to ${previousCommit}`);
  console.log(`[watchdog]    Reason: ${reason}`);

  // Send immediate Discord alert about rollback
  try {
    await sendDiscordEmbed({
      title: "🚨 WATCHDOG ROLLBACK TRIGGERED",
      description: `**${shortName.toUpperCase()} BRIDGE FAILED TO START**\n\nAutomatic rollback in progress...`,
      color: 0xFF0000, // Red
      fields: [
        { name: "Service", value: serviceName, inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Failed Commit", value: `\`${currentCommit}\``, inline: true },
        { name: "Rolling Back To", value: `\`${previousCommit}\``, inline: true },
      ],
      footer: "⚠️ Review the failed commit before attempting fixes",
    });
  } catch (err) {
    console.error(`[watchdog] ⚠️ Failed to send rollback alert: ${err.message}`);
  }

  try {
    // 1. Stop the service
    console.log(`[watchdog]    Stopping ${serviceName}...`);
    execSync(`systemctl --user stop ${serviceName}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    // 2. Rollback git
    console.log(`[watchdog]    Rolling back to ${previousCommit}...`);
    execSync(`git reset --hard ${previousCommit}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

    // 3. Restart the service
    console.log(``);
    console.log(`[watchdog] ════════════════════════════════════════════════════════════════`);
    console.log(`[watchdog] 🔄 RESTARTING ${shortName.toUpperCase()} BRIDGE SERVICE`);
    console.log(`[watchdog]    Service: ${serviceName}`);
    console.log(`[watchdog]    Reason: Rollback recovery from ${currentCommit} to ${previousCommit}`);
    console.log(`[watchdog] ════════════════════════════════════════════════════════════════`);
    console.log(``);
    
    execSync(`systemctl --user restart ${serviceName}`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 10000,
    });

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
      `Watchdog rolled back ${shortName} bridge from ${currentCommit} to ${previousCommit} (${reason})\n\n${memoryBanner}`
    );

    // Send Discord success notification
    try {
      await sendDiscordEmbed({
        title: "✅ Rollback Complete",
        description: `${shortName.toUpperCase()} bridge successfully rolled back and restarted`,
        color: 0x00FF00, // Green
        fields: [
          { name: "Previous Commit", value: `\`${previousCommit}\``, inline: true },
          { name: "Status", value: "Service restarted", inline: true },
        ],
        footer: "Watchdog will continue monitoring",
      });
    } catch (err) {
      console.error(`[watchdog] ⚠️ Failed to send rollback success notification: ${err.message}`);
    }

    console.log(`[watchdog] ✅ Rollback complete for ${shortName}`);
    return true;
  } catch (err) {
    console.error(`[watchdog] ❌ Rollback failed for ${shortName}: ${err.message}`);
    
    // Send critical failure notification
    try {
      await sendDiscordEmbed({
        title: "🚨 ROLLBACK FAILED",
        description: `**CRITICAL: ${shortName.toUpperCase()} BRIDGE ROLLBACK FAILED**\n\nManual intervention required!`,
        color: 0xFF0000, // Red
        fields: [
          { name: "Service", value: serviceName, inline: true },
          { name: "Error", value: err.message.slice(0, 200), inline: false },
        ],
        footer: "⚠️ Manual recovery needed immediately",
      });
    } catch (discordErr) {
      console.error(`[watchdog] ⚠️ Failed to send rollback failure notification: ${discordErr.message}`);
    }
    
    await updateMemory(
      `Watchdog rollback FAILED for ${shortName} bridge: ${err.message}`
    );
    return false;
  }
}

async function checkService(service) {
  const { name: serviceName, shortName } = service;
  const status = getServiceStatus(serviceName);
  const pid = getServicePID(serviceName);
  const activeTime = getServiceActiveTime(serviceName);

  // Track when service was last restarted
  const lastRestart = restartTimestamps.get(serviceName);
  const now = Date.now();

  // Detect new restart
  if (activeTime && (!lastRestart || activeTime.getTime() > lastRestart)) {
    console.log(`[watchdog] 🔍 ${shortName}: New restart detected (PID ${pid || "unknown"})`);
    restartTimestamps.set(serviceName, activeTime.getTime());
  }

  // Check for failures
  if (status === "failed") {
    console.log(`[watchdog] ❌ ${shortName}: Service failed`);
    await rollbackAndRestart(serviceName, shortName, "service failed");
    await verifyAndNotifyRecovery(serviceName, shortName);
    return;
  }

  // Check for stuck activation with proper state tracking
  if (status === "activating") {
    const activatingStart = activatingStateStart.get(serviceName);
    
    if (!activatingStart) {
      // First time seeing "activating" - record start time
      console.log(`[watchdog] ⏳ ${shortName}: Activating (starting grace period)`);
      activatingStateStart.set(serviceName, now);
      return;
    }
    
    // Check how long we've been in activating state
    const activatingDuration = now - activatingStart;
    if (activatingDuration > STARTUP_GRACE_PERIOD_MS) {
      const stuckSeconds = Math.round(activatingDuration / 1000);
      console.log(
        `[watchdog] ❌ ${shortName}: Stuck in activating for ${stuckSeconds}s`
      );
      activatingStateStart.delete(serviceName);
      await rollbackAndRestart(
        serviceName,
        shortName,
        `stuck in activating for ${stuckSeconds}s`
      );
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }
    
    // Still within grace period
    const elapsed = Math.round(activatingDuration / 1000);
    console.log(`[watchdog] ⏳ ${shortName}: Activating (${elapsed}s / ${STARTUP_GRACE_PERIOD_MS / 1000}s grace)`);
    return;
  }
  
  // Clear activating state if service is no longer activating
  if (activatingStateStart.has(serviceName)) {
    activatingStateStart.delete(serviceName);
  }

  // Normal status
  if (status === "active") {
    console.log(`[watchdog] ✅ ${shortName}: OK (PID ${pid || "unknown"})`);
  } else {
    console.log(`[watchdog] ⚠️ ${shortName}: ${status}`);
  }
}

async function monitorLoop() {
  console.log(`[watchdog] 🐕 Bridge watchdog starting...`);
  console.log(`[watchdog]    Check interval: ${CHECK_INTERVAL_MS / 1000}s`);
  console.log(`[watchdog]    Grace period: ${STARTUP_GRACE_PERIOD_MS / 1000}s`);
  console.log(`[watchdog]    Monitored services: ${MONITORED_SERVICES.map(s => s.shortName).join(", ")}`);

  while (true) {
    console.log(`[watchdog] 🔍 Checking services...`);
    
    for (const service of MONITORED_SERVICES) {
      await checkService(service);
    }

    // Wait for next check
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
  }
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[watchdog] Received ${signal}, shutting down...`);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start monitoring
monitorLoop().catch(err => {
  console.error(`[watchdog] Fatal error: ${err.message}`);
  process.exit(1);
});
