# ANQR Bridge Watchdog

## 1. Directory Overview

This directory contains the bridge watchdog module for the ANQR (Agentic Number Query Runner)
harness system. It provides automated monitoring and self-healing capabilities for the Symphony
bridge service by detecting failures, performing automatic rollbacks to the previous git commit, and
notifying via Discord. The watchdog runs continuously, checking service health at regular intervals
and triggering recovery actions when issues are detected. It currently contains 42 files and 0
subdirectories.

## 2. File Summaries

### Files

- **activating-state-start.mjs** - Exports activatingStateStart Map to track when services enter "activating" state
- **catastrophic-patterns.mjs** - Exports CATASTROPHIC_PATTERNS array of regex patterns for detecting critical errors (SyntaxError, TypeError, ERR_REQUIRE_ESM, missing exports, etc.)
- **check-file-integrity.mjs** - Exports checkFileIntegrity() to detect corrupted or truncated critical files
- **check-health-endpoint.mjs** - Exports checkHealthEndpoint() to verify service health via HTTP endpoint
- **check-interval-ms.mjs** - Exports the check interval (default 30 seconds, configurable via WATCHDOG_CHECK_INTERVAL environment variable)
- **check-service.mjs** - Exports checkService() async function that performs comprehensive service health checks including status, PID, activation time, rapid restart detection, catastrophic errors, file integrity, health endpoint, and stuck activation handling
- **detect-catastrophic-errors.mjs** - Exports detectCatastrophicErrors() function to scan journal logs for catastrophic error patterns
- **detect-rapid-restarts.mjs** - Exports detectRapidRestarts() to identify rapid restart patterns
- **get-current-commit.mjs** - Exports getCurrentCommit() to get current git commit hash
- **get-previous-commit.mjs** - Exports getPreviousCommit() to get previous git commit hash for rollback
- **get-service-active-time.mjs** - Exports getServiceActiveTime() to get service activation timestamp
- **get-service-journal.mjs** - Exports getServiceJournal() to fetch recent journalctl output for a service
- **get-service-pid.mjs** - Exports getServicePID() to retrieve service PID via systemctl
- **get-service-status.mjs** - Exports getServiceStatus() to get service state via systemctl (active, inactive, failed, activating)
- **health-check-timeout-ms.mjs** - Exports HEALTH_CHECK_TIMEOUT_MS (5 seconds) for health endpoint checks
- **index.mjs** - Generated facade index that re-exports all public API members from the module
- **is-in-cooldown.mjs** - Exports isInCooldown() function to check if a service is within the recovery cooldown period
- **is-transient-error.mjs** - Exports isTransientError() function to check if journal log contains transient error patterns
- **last-recovery-action.mjs** - Exports lastRecoveryAction Map to track recovery action timestamps per service
- **last-trigger-rate-alert.mjs** - Exports lastTriggerRateAlert and setLastTriggerRateAlert for rate alert tracking
- **logger.mjs** - Shared logger module re-exporting logDebug, logInfo, logWarn, logError from the harness logger
- **monitor-loop.mjs** - Exports monitorLoop() async function that runs the continuous monitoring cycle, checking all services at intervals until shutdown
- **monitored-services.mjs** - Exports MONITORED_SERVICES array defining the Symphony bridge service with name, shortName, port, criticalFiles, and healthEndpoint
- **rapid-restart-history.mjs** - Exports rapidRestartHistory Map to track rapid restart occurrences per service
- **rapid-restart-threshold.mjs** - Exports RAPID_RESTART_THRESHOLD (3 restarts) to trigger recovery
- **rapid-restart-window-ms.mjs** - Exports RAPID_RESTART_WINDOW_MS (120 seconds) for detecting rapid restart patterns
- **recovery-cooldown-ms.mjs** - Exports RECOVERY_COOLDOWN_MS (5 minutes) between recovery actions
- **restart-timestamps.mjs** - Exports restartTimestamps Map to track when each service was last restarted
- **rollback-and-restart.mjs** - Exports rollbackAndRestart() async function that stops service, reverts to previous git commit, restarts service, creates Linear incident, sends Discord notifications, and updates MEMORY.md
- **runtime.mjs** - Generated runtime entry point that imports monitorLoop and shutdown, sets up SIGTERM/SIGINT handlers, and executes the monitor loop with error handling
- **shutdown.mjs** - Exports shutdown() function to handle SIGTERM/SIGINT signals gracefully
- **shutting-down.mjs** - Exports shuttingDown flag and setShuttingDown() for graceful shutdown handling
- **startup-grace-period-ms.mjs** - Exports STARTUP_GRACE_PERIOD_MS (30 seconds) for allowing services time to start
- **track-watchdog-trigger.mjs** - Module that supports track watchdog trigger. Exports `trackWatchdogTrigger`.
- **transient-patterns.mjs** - Exports TRANSIENT_PATTERNS array for detecting transient errors (rate limits, quota exhaustion, timeouts, connection refused)
- **trigger-rate-alert-cooldown-ms.mjs** - Exports TRIGGER_RATE_ALERT_COOLDOWN_MS (1 hour) between rate alerts
- **trigger-rate-threshold.mjs** - Exports TRIGGER_RATE_THRESHOLD (3 triggers) for rate alerts
- **trigger-rate-window-ms.mjs** - Exports TRIGGER_RATE_WINDOW_MS (1 hour) for trigger rate tracking
- **update-memory.mjs** - Exports updateMemory() async function to append entries to MEMORY.md
- **verify-and-notify-recovery.mjs** - Exports verifyAndNotifyRecovery() async function that verifies service is active after recovery and sends success notification
- **watchdog-trigger-history.mjs** - Exports watchdogTriggerHistory array to track all watchdog triggers
- **worktree-id.mjs** - Exports WORKTREE_ID from ANQR_WORKTREE_ID environment variable or defaults to "main"

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/runtime/watchdog/bridge-watchdog/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
