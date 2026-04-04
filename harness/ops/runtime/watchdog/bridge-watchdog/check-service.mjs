import { RAPID_RESTART_THRESHOLD } from "./rapid-restart-threshold.mjs";
import { STARTUP_GRACE_PERIOD_MS } from "./startup-grace-period-ms.mjs";
import { activatingStateStart } from "./activating-state-start.mjs";
import { checkFileIntegrity } from "./check-file-integrity.mjs";
import { checkHealthEndpoint } from "./check-health-endpoint.mjs";
import { detectCatastrophicErrors } from "./detect-catastrophic-errors.mjs";
import { detectRapidRestarts } from "./detect-rapid-restarts.mjs";
import { getServiceActiveTime } from "./get-service-active-time.mjs";
import { getServiceJournal } from "./get-service-journal.mjs";
import { getServicePID } from "./get-service-pid.mjs";
import { getServiceStatus } from "./get-service-status.mjs";
import { isTransientError } from "./is-transient-error.mjs";
import { rapidRestartHistory } from "./rapid-restart-history.mjs";
import { restartTimestamps } from "./restart-timestamps.mjs";
import { rollbackAndRestart } from "./rollback-and-restart.mjs";
import { verifyAndNotifyRecovery } from "./verify-and-notify-recovery.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function checkService(service) {
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
      await rollbackAndRestart(serviceName, shortName, `file corruption: ${fileIssues[0]}`);
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
      if (!health.healthy) {
        logError(`[watchdog] ❌ ${shortName}: Failed + unhealthy endpoint: ${health.reason}`);
        await rollbackAndRestart(
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
      await rollbackAndRestart(
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
        await rollbackAndRestart(
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

  // Normal status
  if (status === "active") {
    logDebug(`[watchdog] ✅ ${shortName}: OK (PID ${pid || "unknown"})`);
  } else {
    logWarn(`[watchdog] ⚠️ ${shortName}: ${status}`);
  }
}
