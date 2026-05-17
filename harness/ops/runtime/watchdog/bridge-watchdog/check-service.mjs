import { RAPID_RESTART_THRESHOLD } from "./rapid-restart-threshold.mjs";
import { STARTUP_GRACE_PERIOD_MS } from "./startup-grace-period-ms.mjs";
import { activatingStateStart } from "./activating-state-start.mjs";
import { checkFileIntegrity } from "./check-file-integrity.mjs";
import { checkHealthEndpoint } from "./check-health-endpoint.mjs";
import { detectCatastrophicErrors } from "./detect-catastrophic-errors.mjs";
import { detectRapidRestarts } from "./detect-rapid-restarts.mjs";
import { getServiceJournal } from "./get-service-journal.mjs";
import { getServicePID } from "./get-service-pid.mjs";
import { getServiceStatus } from "./get-service-status.mjs";
import { getServiceActiveTime } from "./get-service-active-time.mjs";
import { isTransientError } from "./is-transient-error.mjs";
import { rapidRestartHistory } from "./rapid-restart-history.mjs";
import { restartTimestamps } from "./restart-timestamps.mjs";
import { quarantineAndRestart } from "./quarantine-and-restart.mjs";
import { verifyAndNotifyRecovery } from "./verify-and-notify-recovery.mjs";
import { consecutiveUnhealthyCount } from "./consecutive-unhealthy-count.mjs";
import { CONSECUTIVE_UNHEALTHY_MAX } from "./consecutive-unhealthy-max.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function checkService(service) {
  const { name: serviceName, shortName } = service;
  const status = getServiceStatus(serviceName);
  const pid = getServicePID(serviceName);

  // Track when service was last restarted - use PID for accurate restart detection
  const lastPid = restartTimestamps.get(serviceName);
  const now = Date.now();

  // Detect new restart by comparing PID - only log when PID actually changes
  if (pid && pid !== lastPid) {
    logInfo(`[watchdog] 🔍 ${shortName}: New restart detected (PID ${pid})`);
    restartTimestamps.set(serviceName, pid);

    // Clear consecutive unhealthy count on fresh restart (stale counts
    // from a previous hung instance should not accumulate across restarts)
    consecutiveUnhealthyCount.delete(serviceName);

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
      await quarantineAndRestart(
        serviceName,
        shortName,
        `catastrophic error: ${catastrophicError}`,
      );
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
      await quarantineAndRestart(serviceName, shortName, `file corruption: ${fileIssues[0]}`);
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }

    // Check if it's just transient errors (rate limits, etc.)
    if (isTransientError(journalLog)) {
      logWarn(
        `[watchdog] ⚠️ ${shortName}: Failed but only transient errors detected - not rolling back`,
      );
    } else {
      // Try health check anyway - maybe service is running but unhealthy
      const health = await checkHealthEndpoint(service);
      if (health.healthy) {
        // Health check passed — continue with normal status handling
      } else {
        logError(`[watchdog] ❌ ${shortName}: Failed + unhealthy endpoint: ${health.reason}`);
        await quarantineAndRestart(
          serviceName,
          shortName,
          `service failed + unhealthy: ${health.reason}`,
        );
        await verifyAndNotifyRecovery(serviceName, shortName);
        return;
      }
    }

    return;
  }

  // Check for rapid restart pattern (even if status is "active")
  // Note: detectRapidRestarts was already called when we detected the new restart above
  const hasRapidRestarts =
    (rapidRestartHistory.get(serviceName) || []).length >= RAPID_RESTART_THRESHOLD;
  if (hasRapidRestarts) {
    // Service keeps restarting - likely corrupted file that systemd keeps trying to run
    logError(
      `[watchdog] 🚨 ${shortName}: Rapid restart pattern detected - checking for file corruption`,
    );

    const fileIssues = await checkFileIntegrity(service);
    if (fileIssues.length > 0) {
      await quarantineAndRestart(
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
      await quarantineAndRestart(
        serviceName,
        shortName,
        `rapid restarts + error: ${catastrophicError}`,
      );
      await verifyAndNotifyRecovery(serviceName, shortName);
      return;
    }
  }

  // If service is active, do a health check to verify it's actually working
  if (status === "active") {
    const health = await checkHealthEndpoint(service);
    const activeSince = getServiceActiveTime(serviceName);
    if (!health.healthy) {
      // Track consecutive unhealthy checks
      const prev = consecutiveUnhealthyCount.get(serviceName) || 0;
      const count = prev + 1;
      consecutiveUnhealthyCount.set(serviceName, count);

      const activeSinceMsg = activeSince
        ? `, active for ${Math.round((Date.now() - activeSince.getTime()) / 1000)} seconds`
        : "";
      logWarn(
        `[watchdog] ${shortName}: Service active but unhealthy, ${count} out of ${CONSECUTIVE_UNHEALTHY_MAX} checks failed. Reason: ${health.reason}${activeSinceMsg}.`,
      );

      // If threshold exceeded, restart the hung service
      if (count >= CONSECUTIVE_UNHEALTHY_MAX) {
        logError(
          `[watchdog] 🚨 ${shortName}: ${count} consecutive unhealthy checks — forcing restart`,
        );
        consecutiveUnhealthyCount.delete(serviceName);
        await quarantineAndRestart(
          serviceName,
          shortName,
          `hung service: ${count} consecutive unhealthy health checks`,
        );
        await verifyAndNotifyRecovery(serviceName, shortName);
      }
    } else {
      // Reset consecutive unhealthy count on success
      if (consecutiveUnhealthyCount.has(serviceName)) {
        consecutiveUnhealthyCount.delete(serviceName);
      }
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
        await quarantineAndRestart(
          serviceName,
          shortName,
          `stuck activating + file corruption: ${fileIssues[0]}`,
        );
      } else {
        await quarantineAndRestart(
          serviceName,
          shortName,
          `stuck in activating for ${stuckSeconds}s`,
        );
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

  const watchdogUptimeMs = Math.floor(process.uptime() * 1000);
  if (status === "inactive" && watchdogUptimeMs < STARTUP_GRACE_PERIOD_MS) {
    logDebug(
      `[watchdog] ⏳ ${shortName}: inactive during startup grace (${Math.round(watchdogUptimeMs / 1000)}s / ${STARTUP_GRACE_PERIOD_MS / 1000}s)`,
    );
    return;
  }

  // Normal status
  if (status === "active") {
    logDebug(`[watchdog] ✅ ${shortName}: OK (PID ${pid || "unknown"})`);
  } else {
    logWarn(`[watchdog] ⚠️ ${shortName}: ${status}`);
  }
}
