#!/usr/bin/env node

/**
 * bridge-watchdog.mjs — Watchdog for Symphony and Codebuff bridges
 *
 * Enhanced watchdog that detects catastrophic failures and automatically recovers.
 *
 * Features:
 *   - Monitors systemd service status every 30 seconds
 *   - Detects rapid restart cycles (failure to stay running)
 *   - Performs HTTP health checks on bridge endpoints
 *   - Parses journal logs for known error patterns
 *   - Checks file integrity on critical module files
 *   - Automatically rolls back to previous git commit on catastrophic failure
 *   - Uses file integrity checks to detect corruption
 *
 * Environment:
 *   WATCHDOG_CHECK_INTERVAL — Check interval in seconds (default: 30)
 */

import { execSync } from "node:child_process";
import { appendFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { sendDiscordEmbed } from "../../integrations/notifications/discord-webhook.mjs";

const CHECK_INTERVAL_MS = (Number.parseInt(process.env.WATCHDOG_CHECK_INTERVAL) || 30) * 1000;
const STARTUP_GRACE_PERIOD_MS = 30 * 1000; // 30 seconds grace period for startup

// Rapid restart detection: trigger if service restarts N times within this window
const RAPID_RESTART_WINDOW_MS = 120 * 1000; // 2 minutes
const RAPID_RESTART_THRESHOLD = 3; // 3 restarts in 2 minutes = catastrophic failure

// Health check timeout
const HEALTH_CHECK_TIMEOUT_MS = 5000;

const MONITORED_SERVICES = [
  {
    name: "anqr-symphony-bridge.service",
    shortName: "symphony",
    port: 4319,
    criticalFiles: [
      "scripts/ops/integrations/model/symphony-credit-gate.mjs",
      "scripts/ops/integrations/model/symphony-openai-bridge.mjs",
      "scripts/ops/integrations/model/symphony-session-state.mjs",
    ],
    healthEndpoint: "http://127.0.0.1:4319/health",
  },
  {
    name: "anqr-codebuff-bridge.service",
    shortName: "codebuff",
    port: 4318,
    criticalFiles: [
      "scripts/ops/integrations/model/codebuff-openai-bridge.mjs",
    ],
    healthEndpoint: "http://127.0.0.1:4318/health",
  },
];

// Known error patterns that indicate catastrophic failure (not transient)
const CATASTROPHIC_PATTERNS = [
  /SyntaxError.*does not provide an export/,
  /SyntaxError.* Unexpected token/,
  /SyntaxError.* Cannot find module/,
  /SyntaxError.* Module not found/,
  /TypeError.* is not a function/,
  /TypeError.* is not defined/,
  /ERR_REQUIRE_ESM/,
  /missing.*export/,
  /failed to locate/,
];

// Known transient error patterns - don't trigger immediate rollback
const TRANSIENT_PATTERNS = [
  /429.*rate.?limit/i,
  /quota.*exhausted/i,
  /usage limit/i,
  /timeout/i,
  /ECONNREFUSED/i,
  /provider.*exhausted/i,
];

import { createLogger } from "../../lib/logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger();

// Track restart timestamps and activating state
const restartTimestamps = new Map();
const activatingStateStart = new Map();

// Track rapid restarts: array of timestamps when service was restarted
const rapidRestartHistory = new Map();

// Track last recovery action to avoid repeated rollbacks
const lastRecoveryAction = new Map();
const RECOVERY_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between rollbacks

// Shutdown flag for graceful loop exit
let shuttingDown = false;

async function updateMemory(note) {
  const timestamp = new Date().toISOString();
  const entry = `\n### ${timestamp} - ${note}\n`;
  try {
    await appendFile(path.join(process.cwd(), "MEMORY.md"), entry);
    logInfo(`[watchdog] 📝 Updated MEMORY.md: ${note}`);
  } catch (err) {
    logWarn(`[watchdog] ⚠️ Failed to update MEMORY.md: ${err.message}`);
  }
}

function getServiceStatus(serviceName) {
  try {
    const output = execSync(`systemctl --user is-active ${serviceName} 2>&1 || true`, {
      encoding: "utf-8",
      timeout: 5000,
    });
    return output.trim();
  } catch {
    return "unknown";
  }
}

function getServicePID(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=MainPID --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 },
    );
    const pid = Number.parseInt(output.trim());
    return pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function getServiceActiveTime(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=ActiveEnterTimestamp --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 },
    );
    const timestamp = output.trim();
    if (!timestamp || timestamp === "0") return null;
    return new Date(timestamp);
  } catch {
    return null;
  }
}

/**
 * Get recent journal logs for a service
 */
function getServiceJournal(serviceName, lines = 50) {
  try {
    const output = execSync(
      `journalctl --user -u ${serviceName} -n ${lines} --no-pager 2>&1 || true`,
      { encoding: "utf-8", timeout: 10000 },
    );
    return output;
  } catch {
    return "";
  }
}

/**
 * Check for catastrophic error patterns in journal logs
 */
function detectCatastrophicErrors(journalLog) {
  for (const pattern of CATASTROPHIC_PATTERNS) {
    const match = journalLog.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

/**
 * Check if error is transient (don't trigger rollback)
 */
function isTransientError(journalLog) {
  for (const pattern of TRANSIENT_PATTERNS) {
    if (pattern.test(journalLog)) {
      return true;
    }
  }
  return false;
}

/**
 * Check file integrity - verify critical files exist and have reasonable size
 */
async function checkFileIntegrity(service) {
  const issues = [];
  const cwd = process.cwd();

  for (const filePath of service.criticalFiles || []) {
    try {
      const fullPath = path.join(cwd, filePath);
      const stats = await stat(fullPath);

      // Check for obviously truncated files (< 100 bytes is suspicious for module files)
      if (stats.size < 100) {
        issues.push(`${filePath} is suspiciously small (${stats.size} bytes)`);
      }

      // Read first few lines to check for obvious corruption
      const content = await readFile(fullPath, "utf-8");
      const firstLine = content.split("\n")[0] || "";

      // If file starts with just a comment, it's likely truncated
      if (firstLine.startsWith("//") && content.split("\n").length < 5) {
        issues.push(`${filePath} appears truncated (only ${content.split("\n").length} lines)`);
      }
    } catch (err) {
      issues.push(`${filePath} not found or unreadable: ${err.message}`);
    }
  }

  return issues;
}

/**
 * Perform HTTP health check on bridge endpoint
 */
async function checkHealthEndpoint(service) {
  const { healthEndpoint } = service;

  if (!healthEndpoint) {
    return { healthy: true, reason: "no health endpoint configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    const response = await fetch(healthEndpoint, {
      signal: controller.signal,
      method: "GET",
    });

    clearTimeout(timeout);

    if (response.ok) {
      try {
        const data = await response.json();
        const available = data.providersAvailable || 0;
        const configured = data.providersConfigured || 0;
        return {
          healthy: true,
          reason: `healthy (${available}/${configured} providers)`,
        };
      } catch {
        return { healthy: true, reason: "responded OK" };
      }
    } else {
      return { healthy: false, reason: `HTTP ${response.status}` };
    }
  } catch (err) {
    const errStr = err.message || String(err);
    if (errStr.includes("abort")) {
      return { healthy: false, reason: "health check timeout" };
    }
    return { healthy: false, reason: `connection failed: ${errStr.slice(0, 50)}` };
  }
}

/**
 * Track rapid restart pattern - returns true if catastrophic failure detected
 */
function detectRapidRestarts(serviceName) {
  const now = Date.now();
  const history = rapidRestartHistory.get(serviceName) || [];

  // Add current timestamp to history
  history.push(now);

  // Filter to only recent restarts within the window
  const recentRestarts = history.filter(
    (ts) => now - ts < RAPID_RESTART_WINDOW_MS
  );

  rapidRestartHistory.set(serviceName, recentRestarts);

  // Check if threshold exceeded
  if (recentRestarts.length >= RAPID_RESTART_THRESHOLD) {
    logWarn(
      `[watchdog] 🚨 ${serviceName}: Detected ${recentRestarts.length} rapid restarts in ${RAPID_RESTART_WINDOW_MS / 1000}s - CATASTROPHIC FAILURE`,
    );
    return true;
  }

  return false;
}

/**
 * Check if we're in cooldown period after a recovery action
 */
function isInCooldown(serviceName) {
  const lastRecovery = lastRecoveryAction.get(serviceName);
  if (!lastRecovery) return false;

  const cooldownRemaining = Date.now() - lastRecovery;
  if (cooldownRemaining < RECOVERY_COOLDOWN_MS) {
    logInfo(
      `[watchdog] ⏳ ${serviceName}: Recovery cooldown active (${Math.round((RECOVERY_COOLDOWN_MS - cooldownRemaining) / 1000)}s remaining)`,
    );
    return true;
  }

  // Cooldown expired, reset
  lastRecoveryAction.delete(serviceName);
  return false;
}

function getCurrentCommit() {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
      timeout: 5000,
    }).trim();
  } catch (err) {
    logError(`[watchdog] Failed to get current commit: ${err.message}`);
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
    logError(`[watchdog] Failed to get previous commit: ${err.message}`);
    return null;
  }
}

async function verifyAndNotifyRecovery(serviceName, shortName) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const recoveryStatus = getServiceStatus(serviceName);
  if (recoveryStatus === "active") {
    try {
      await sendDiscordEmbed({
        title: "🎉 Recovery Successful",
        description: `${shortName.toUpperCase()} bridge is now healthy after rollback`,
        color: 0x00ff00, // Green
        fields: [
          { name: "Service", value: serviceName, inline: true },
          { name: "Status", value: "Active", inline: true },
        ],
      });
    } catch (err) {
      logError(`[watchdog] ⚠️ Failed to send recovery notification: ${err.message}`);
    }
  }
}

async function rollbackAndRestart(serviceName, shortName, reason) {
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
      title: "🚨 WATCHDOG ROLLBACK TRIGGERED",
      description: `**${shortName.toUpperCase()} BRIDGE FAILED TO START**\n\nAutomatic rollback in progress...`,
      color: 0xff0000, // Red
      fields: [
        { name: "Service", value: serviceName, inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Failed Commit", value: `\`${currentCommit}\``, inline: true },
        { name: "Rolling Back To", value: `\`${previousCommit}\``, inline: true },
      ],
      footer: "⚠️ Review the failed commit before attempting fixes",
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
        title: "✅ Rollback Complete",
        description: `${shortName.toUpperCase()} bridge successfully rolled back and restarted`,
        color: 0x00ff00, // Green
        fields: [
          { name: "Previous Commit", value: `\`${previousCommit}\``, inline: true },
          { name: "Status", value: "Service restarted", inline: true },
        ],
        footer: "Watchdog will continue monitoring",
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
        title: "🚨 ROLLBACK FAILED",
        description: `**CRITICAL: ${shortName.toUpperCase()} BRIDGE ROLLBACK FAILED**\n\nManual intervention required!`,
        color: 0xff0000, // Red
        fields: [
          { name: "Service", value: serviceName, inline: true },
          { name: "Error", value: err.message.slice(0, 200), inline: false },
        ],
        footer: "⚠️ Manual recovery needed immediately",
      });
    } catch (error_) {
      logError(`[watchdog] ⚠️ Failed to send rollback failure notification: ${error_.message}`);
    }

    await updateMemory(`Watchdog rollback FAILED for ${shortName} bridge: ${err.message}`);
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

  // Detect new restart and track for rapid restart detection
  if (activeTime && (!lastRestart || activeTime.getTime() > lastRestart)) {
    logInfo(`[watchdog] 🔍 ${shortName}: New restart detected (PID ${pid || "unknown"})`);
    restartTimestamps.set(serviceName, activeTime.getTime());

    // Track for rapid restart detection
    detectRapidRestarts(serviceName);
  }

  // Check for immediate failures (not just "activating" stuck)
  if (status === "failed") {
    logError(`[watchdog] ❌ ${shortName}: Service failed`);

    // Check journal for catastrophic errors FIRST
    const journalLog = getServiceJournal(serviceName, 30);
    const catastrophicError = detectCatastrophicErrors(journalLog);

    if (catastrophicError) {
      logError(`[watchdog] 🚨 ${shortName}: Detected catastrophic error: ${catastrophicError}`);
      await rollbackAndRestart(serviceName, shortName, `catastrophic error: ${catastrophicError}`);
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }

    // Check file integrity
    const fileIssues = await checkFileIntegrity(service);
    if (fileIssues.length > 0) {
      logError(`[watchdog] 🚨 ${shortName}: File integrity issues detected:`);
      for (const issue of fileIssues) {
        logError(`[watchdog]    - ${issue}`);
      }
      await rollbackAndRestart(
        serviceName,
        shortName,
        `file corruption: ${fileIssues[0]}`,
      );
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }

    // Check if it's just transient errors (rate limits, etc.)
    if (isTransientError(journalLog)) {
      logWarn(`[watchdog] ⚠️ ${shortName}: Failed but only transient errors detected - not rolling back`);
    } else {
      // Try health check anyway - maybe service is running but unhealthy
      const health = await checkHealthEndpoint(service);
      if (!health.healthy) {
        logError(`[watchdog] ❌ ${shortName}: Failed + unhealthy endpoint: ${health.reason}`);
        await rollbackAndRestart(serviceName, shortName, `service failed + unhealthy: ${health.reason}`);
        await verifyAndNotifyRecovery(serviceName, shortName);
        return;
      }
    }

    return;
  }

  // Check for rapid restart pattern (even if status is "active")
  // Note: detectRapidRestarts was already called when we detected the new restart above
  const hasRapidRestarts = (rapidRestartHistory.get(serviceName) || []).length >= RAPID_RESTART_THRESHOLD;
  if (hasRapidRestarts) {
    // Service keeps restarting - likely corrupted file that systemd keeps trying to run
    logError(`[watchdog] 🚨 ${shortName}: Rapid restart pattern detected - checking for file corruption`);

    const fileIssues = await checkFileIntegrity(service);
    if (fileIssues.length > 0) {
      await rollbackAndRestart(
        serviceName,
        shortName,
        `rapid restarts + file corruption: ${fileIssues[0]}`,
      );
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }

    // Check journal
    const journalLog = getServiceJournal(serviceName, 30);
    const catastrophicError = detectCatastrophicErrors(journalLog);
    if (catastrophicError) {
      await rollbackAndRestart(serviceName, shortName, `rapid restarts + error: ${catastrophicError}`);
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }
  }

  // If service is active, do a health check to verify it's actually working
  if (status === "active") {
    const health = await checkHealthEndpoint(service);
    if (!health.healthy) {
      logWarn(`[watchdog] ⚠️ ${shortName}: Service active but unhealthy: ${health.reason}`);
      // Not rolling back immediately - give it time to recover
      // But log it for visibility
    } else {
      logDebug(`[watchdog] ✅ ${shortName}: OK (PID ${pid || "unknown"}) - ${health.reason}`);
    }
  }

  // Check for stuck activation with proper state tracking
  if (status === "activating") {
    const activatingStart = activatingStateStart.get(serviceName);

    if (!activatingStart) {
      // First time seeing "activating" - record start time
      logInfo(`[watchdog] ⏳ ${shortName}: Activating (starting grace period)`);
      activatingStateStart.set(serviceName, now);
      return;
    }

    // Check how long we've been in activating state
    const activatingDuration = now - activatingStart;
    if (activatingDuration > STARTUP_GRACE_PERIOD_MS) {
      const stuckSeconds = Math.round(activatingDuration / 1000);
      logWarn(`[watchdog] ❌ ${shortName}: Stuck in activating for ${stuckSeconds}s`);

      // Check for file corruption before rollback
      const fileIssues = await checkFileIntegrity(service);
      if (fileIssues.length > 0) {
        await rollbackAndRestart(
          serviceName,
          shortName,
          `stuck activating + file corruption: ${fileIssues[0]}`,
        );
      } else {
        await rollbackAndRestart(serviceName, shortName, `stuck in activating for ${stuckSeconds}s`);
      }

      activatingStateStart.delete(serviceName);
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }

    // Still within grace period
    const elapsed = Math.round(activatingDuration / 1000);
    logDebug(
      `[watchdog] ⏳ ${shortName}: Activating (${elapsed}s / ${STARTUP_GRACE_PERIOD_MS / 1000}s grace)`,
    );
    return;
  }

  // Clear activating state if service is no longer activating
  if (activatingStateStart.has(serviceName)) {
    activatingStateStart.delete(serviceName);
  }

  // Normal status
  if (status === "active") {
    logDebug(`[watchdog] ✅ ${shortName}: OK (PID ${pid || "unknown"})`);
  } else {
    logWarn(`[watchdog] ⚠️ ${shortName}: ${status}`);
  }
}

async function monitorLoop() {
  logInfo(`[watchdog] 🐕 Bridge watchdog starting...`);
  logInfo(`[watchdog]    Check interval: ${CHECK_INTERVAL_MS / 1000}s`);
  logInfo(`[watchdog]    Grace period: ${STARTUP_GRACE_PERIOD_MS / 1000}s`);
  logInfo(
    `[watchdog]    Monitored services: ${MONITORED_SERVICES.map((s) => s.shortName).join(", ")}`,
  );
  logInfo(`[watchdog]    Rapid restart threshold: ${RAPID_RESTART_THRESHOLD} in ${RAPID_RESTART_WINDOW_MS / 1000}s`);

  // shuttingDown is modified by signal handlers (SIGTERM, SIGINT)
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!shuttingDown) {
    logInfo(`[watchdog] 🔍 Checking services...`);

    for (const service of MONITORED_SERVICES) {
      await checkService(service);
    }

    // Wait for next check (but check shutdown flag periodically)
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
  }

  logInfo(`[watchdog] 🛑 Monitor loop exiting gracefully`);
}

// Graceful shutdown
function shutdown(signal) {
  logInfo(`\n[watchdog] Received ${signal}, shutting down...`);
  shuttingDown = true;
  // Give the loop a moment to exit cleanly
  setTimeout(() => {
    logInfo(`[watchdog] Exit complete`);
    process.exit(0);
  }, 100);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start monitoring
try {
  await monitorLoop();
} catch (err) {
  logError(`[watchdog] Fatal error: ${err.message}`);
  process.exit(1);
}