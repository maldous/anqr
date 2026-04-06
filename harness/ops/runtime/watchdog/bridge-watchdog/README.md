# ANQR Bridge Watchdog

## 1. Directory Overview

This directory contains the bridge watchdog module for the ANQR (Agentic Number Query Runner) harness system. It provides automated monitoring and self-healing capabilities for the Symphony bridge service by detecting failures, performing automatic rollbacks to the previous git commit, and notifying via Discord. The watchdog runs continuously, checking service health at regular intervals and triggering recovery actions when issues are detected.

## 2. File Summaries

### Configuration Constants

- **check-interval-ms.mjs** - Exports the check interval (default 30 seconds, configurable via WATCHDOG_CHECK_INTERVAL environment variable)
- **startup-grace-period-ms.mjs** - Exports STARTUP_GRACE_PERIOD_MS (30 seconds) for allowing services time to start
- **rapid-restart-window-ms.mjs** - Exports RAPID_RESTART_WINDOW_MS (120 seconds) for detecting rapid restart patterns
- **rapid-restart-threshold.mjs** - Exports RAPID_RESTART_THRESHOLD (3 restarts) to trigger recovery
- **health-check-timeout-ms.mjs** - Exports HEALTH_CHECK_TIMEOUT_MS (5 seconds) for health endpoint checks
- **recovery-cooldown-ms.mjs** - Exports RECOVERY_COOLDOWN_MS (5 minutes) between recovery actions
- **trigger-rate-window-ms.mjs** - Exports TRIGGER_RATE_WINDOW_MS (1 hour) for trigger rate tracking
- **trigger-rate-threshold.mjs** - Exports TRIGGER_RATE_THRESHOLD (3 triggers) for rate alerts
- **trigger-rate-alert-cooldown-ms.mjs** - Exports TRIGGER_RATE_ALERT_COOLDOWN_MS (1 hour) between rate alerts

### State Management

- **worktree-id.mjs** - Exports WORKTREE_ID from ANQR_WORKTREE_ID environment variable or defaults to "main"
- **shutting-down.mjs** - Exports shuttingDown flag and setShuttingDown() for graceful shutdown handling
- **restart-timestamps.mjs** - Exports restartTimestamps Map to track when each service was last restarted
- **activating-state-start.mjs** - Exports activatingStateStart Map to track when services enter "activating" state
- **rapid-restart-history.mjs** - Exports rapidRestartHistory Map to track rapid restart occurrences per service
- **watchdog-trigger-history.mjs** - Exports watchdogTriggerHistory array to track all watchdog triggers
- **last-recovery-action.mjs** - Exports lastRecoveryAction Map to track recovery action timestamps per service
- **last-trigger-rate-alert.mjs** - Exports lastTriggerRateAlert and setLastTriggerRateAlert for rate alert tracking

### Error Detection

- **catastrophic-patterns.mjs** - Exports CATASTROPHIC_PATTERNS array of regex patterns for detecting critical errors (SyntaxError, TypeError, ERR_REQUIRE_ESM, missing exports, etc.)
- **transient-patterns.mjs** - Exports TRANSIENT_PATTERNS array for detecting transient errors (rate limits, quota exhaustion, timeouts, connection refused)
- **is-transient-error.mjs** - Exports isTransientError() function to check if journal log contains transient error patterns
- **detect-catastrophic-errors.mjs** - Exports detectCatastrophicErrors() function to scan journal logs for catastrophic error patterns

### Service Monitoring

- **monitored-services.mjs** - Exports MONITORED_SERVICES array defining the Symphony bridge service with name, shortName, port, criticalFiles, and healthEndpoint
- **get-service-status.mjs** - Exports getServiceStatus() to get service state via systemctl (active, inactive, failed, activating)
- **get-service-pid.mjs** - Exports getServicePID() to retrieve service PID via systemctl
- **get-service-active-time.mjs** - Exports getServiceActiveTime() to get service activation timestamp
- **get-service-journal.mjs** - Exports getServiceJournal() to fetch recent journalctl output for a service
- **check-health-endpoint.mjs** - Exports checkHealthEndpoint() to verify service health via HTTP endpoint
- **check-file-integrity.mjs** - Exports checkFileIntegrity() to detect corrupted or truncated critical files
- **detect-rapid-restarts.mjs** - Exports detectRapidRestarts() to identify rapid restart patterns

### Recovery Actions

- **rollback-and-restart.mjs** - Exports rollbackAndRestart() async function that stops service, reverts to previous git commit, restarts service, creates Linear incident, sends Discord notifications, and updates MEMORY.md
- **verify-and-notify-recovery.mjs** - Exports verifyAndNotifyRecovery() async function that verifies service is active after recovery and sends success notification
- **track-watchdogTrigger.mjs** - Exports trackWatchdogTrigger() async function that tracks triggers and sends high-rate alerts via Discord when threshold exceeded

### Core Logic

- **check-service.mjs** - Exports checkService() async function that performs comprehensive service health checks including status, PID, activation time, rapid restart detection, catastrophic errors, file integrity, health endpoint, and stuck activation handling
- **monitor-loop.mjs** - Exports monitorLoop() async function that runs the continuous monitoring cycle, checking all services at intervals until shutdown
- **shutdown.mjs** - Exports shutdown() function to handle SIGTERM/SIGINT signals gracefully

### Utilities

- **logger.mjs** - Shared logger module re-exporting logDebug, logInfo, logWarn, logError from the harness logger
- **get-current-commit.mjs** - Exports getCurrentCommit() to get current git commit hash
- **get-previous-commit.mjs** - Exports getPreviousCommit() to get previous git commit hash for rollback
- **update-memory.mjs** - Exports updateMemory() async function to append entries to MEMORY.md
- **is-in-cooldown.mjs** - Exports isInCooldown() function to check if a service is within the recovery cooldown period

### Entry Points

- **index.mjs** - Generated facade index that re-exports all public API members from the module
- **runtime.mjs** - Generated runtime entry point that imports monitorLoop and shutdown, sets up SIGTERM/SIGINT handlers, and executes the monitor loop with error handling

## 3. Overall Directory Function

This directory implements the self-healing watchdog system for the ANQR harness. The watchdog continuously monitors the Symphony bridge service using a configurable check interval (default 30 seconds). When a service fails or enters a problematic state, the module performs a cascade of diagnostic checks: detecting catastrophic errors in journal logs, identifying file corruption, verifying health endpoints, and recognizing rapid restart patterns.

The key recovery mechanism is automatic git rollback - when issues are detected, the watchdog stops the service, resets to the previous commit, restarts the service, and updates MEMORY.md with a detailed banner. Discord notifications are sent throughout the recovery process (rollback initiated, rollback complete, recovery successful, or critical failure). The module enforces a cooldown period between recovery actions to prevent recovery loops, and tracks trigger rates to send alerts when instability exceeds thresholds.

The watchdog integrates with Linear for incident creation and Discord for real-time notifications, making it a fully autonomous fault-handling system that requires no manual intervention for common failure scenarios.

## 4. Usage Instructions

This directory is not typically run directly but is executed as part of the watchdog systemd service. The primary entry point is the runtime.mjs which can be invoked directly:

```bash
node ops/runtime/watchdog/bridge-watchdog/runtime.mjs
```

The watchdog monitors services defined in MONITORED_SERVICES (currently just anqr-symphony-bridge.service). It checks service status via systemctl, verifies health endpoints, scans journal logs for error patterns, and performs file integrity checks on critical files.

### Environment Variables

- **ANQR_WORKTREE_ID** - Worktree identifier for Discord notifications (defaults to "main")
- **WATCHDOG_CHECK_INTERVAL** - Override check interval in seconds (default 30)

### Integration

The module is typically imported by other watchdog components:

```javascript
import { monitorLoop, shutdown } from "./ops/runtime/watchdog/bridge-watchdog/index.mjs";
```

## 5. Dependencies

### Internal Dependencies

- **../../../integrations/linear/incident-manager.mjs** - For creating/updating incidents on watchdog triggers
- **../../../integrations/notifications/openclaw-discord.mjs** - For sending Discord embed notifications
- **../../../lib/logger.mjs** - For logging infrastructure

### External Services

- **systemd** - Uses systemctl for service management (status, PID, stop, restart)
- **git** - Uses git commands for commit tracking and rollback (rev-parse, reset)
- **journalctl** - For fetching service journal logs
- **Linear** - Issue tracking for incident creation
- **Discord** - Real-time notifications via webhooks

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- systemd user services configured
- Git repository with commit history
- MEMORY.md file in working directory for updateMemory()

## 6. Additional Comments

- **Fail-Safe Design**: The watchdog distinguishes between transient errors (rate limits, timeouts) which don't trigger rollback, versus catastrophic errors (SyntaxError, TypeError, missing exports) which trigger immediate rollback. This prevents unnecessary recovery actions for temporary issues.

- **Graceful Degradation**: Services in "activating" state are given a 30-second grace period before being considered stuck. This accommodates normal startup times while still catching genuinely stuck services.

- **File Integrity Checking**: Before rolling back, the watchdog checks critical module files (symphony-agent-router.mjs, symphony-credit-gate.mjs, symphony-openai-bridge.mjs, codebuff-direct.mjs) for truncation or corruption, as these are common causes of startup failures.

- **Rate Limiting**: Both recovery actions and trigger rate alerts have cooldowns (5 minutes and 1 hour respectively) to prevent alert spam and recovery loops while still providing timely notifications.

- **State Persistence**: The module uses in-memory Maps and arrays for state tracking (restart timestamps, activating state, rapid restart history, trigger history). This state is lost on restart but is rebuild dynamically during operation.