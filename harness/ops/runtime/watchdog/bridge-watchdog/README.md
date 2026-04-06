# ANQR Bridge Watchdog

## 1. Directory Overview

This directory implements **ANQR Bridge Watchdog** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 42 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **activating-state-start.mjs** - Exports `activatingStateStart`, which implements activating state start.
- **catastrophic-patterns.mjs** - Exports `CATASTROPHIC_PATTERNS`, a shared constant used by sibling modules.
- **check-file-integrity.mjs** - Exports `checkFileIntegrity`, which checks file integrity.
- **check-health-endpoint.mjs** - Exports `checkHealthEndpoint`, which checks health endpoint.
- **check-interval-ms.mjs** - Exports `CHECK_INTERVAL_MS`, a shared constant used by sibling modules.
- **check-service.mjs** - Exports `checkService`, which checks service.
- **detect-catastrophic-errors.mjs** - Exports `detectCatastrophicErrors`, which detects catastrophic errors.
- **detect-rapid-restarts.mjs** - Exports `detectRapidRestarts`, which detects rapid restarts.
- **get-current-commit.mjs** - Exports `getCurrentCommit`, which gets current commit.
- **get-previous-commit.mjs** - Exports `getPreviousCommit`, which gets previous commit.
- **get-service-active-time.mjs** - Exports `getServiceActiveTime`, which gets service active time.
- **get-service-journal.mjs** - Exports `getServiceJournal`, which gets service journal.
- **get-service-pid.mjs** - Exports `getServicePID`, which gets service pid.
- **get-service-status.mjs** - Exports `getServiceStatus`, which gets service status.
- **health-check-timeout-ms.mjs** - Exports `HEALTH_CHECK_TIMEOUT_MS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./check-interval-ms.mjs`, `./startup-grace-period-ms.mjs`, `./rapid-restart-window-ms.mjs`, `./rapid-restart-threshold.mjs`, `./health-check-timeout-ms.mjs`, `./worktree-id.mjs`, and 33 more siblings.
- **is-in-cooldown.mjs** - Exports `isInCooldown`, which checks whether in cooldown.
- **is-transient-error.mjs** - Exports `isTransientError`, which checks whether transient error.
- **last-recovery-action.mjs** - Exports `lastRecoveryAction`, which implements last recovery action.
- **last-trigger-rate-alert.mjs** - Exports `lastTriggerRateAlert`, `setLastTriggerRateAlert`, providing the reusable API for this directory concern.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **monitor-loop.mjs** - Exports `monitorLoop`, which implements monitor loop.
- **monitored-services.mjs** - Exports `MONITORED_SERVICES`, a shared constant used by sibling modules.
- **rapid-restart-history.mjs** - Exports `rapidRestartHistory`, which implements rapid restart history.
- **rapid-restart-threshold.mjs** - Exports `RAPID_RESTART_THRESHOLD`, a shared constant used by sibling modules.
- **rapid-restart-window-ms.mjs** - Exports `RAPID_RESTART_WINDOW_MS`, a shared constant used by sibling modules.
- **recovery-cooldown-ms.mjs** - Exports `RECOVERY_COOLDOWN_MS`, a shared constant used by sibling modules.
- **restart-timestamps.mjs** - Exports `restartTimestamps`, which implements restart timestamps.
- **rollback-and-restart.mjs** - Exports `rollbackAndRestart`, which implements rollback and restart.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **shutdown.mjs** - Exports `shutdown`, which implements shutdown.
- **shutting-down.mjs** - Exports `setShuttingDown`, `shuttingDown`, providing the reusable API for this directory concern.
- **startup-grace-period-ms.mjs** - Exports `STARTUP_GRACE_PERIOD_MS`, a shared constant used by sibling modules.
- **track-watchdog-trigger.mjs** - Exports `trackWatchdogTrigger`, which implements track watchdog trigger.
- **transient-patterns.mjs** - Exports `TRANSIENT_PATTERNS`, a shared constant used by sibling modules.
- **trigger-rate-alert-cooldown-ms.mjs** - Exports `TRIGGER_RATE_ALERT_COOLDOWN_MS`, a shared constant used by sibling modules.
- **trigger-rate-threshold.mjs** - Exports `TRIGGER_RATE_THRESHOLD`, a shared constant used by sibling modules.
- **trigger-rate-window-ms.mjs** - Exports `TRIGGER_RATE_WINDOW_MS`, a shared constant used by sibling modules.
- **update-memory.mjs** - Exports `updateMemory`, which implements update memory.
- **verify-and-notify-recovery.mjs** - Exports `verifyAndNotifyRecovery`, which verifies and notify recovery.
- **watchdog-trigger-history.mjs** - Exports `watchdogTriggerHistory`, an initially empty array used by sibling modules.
- **worktree-id.mjs** - Exports `WORKTREE_ID`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Discord integration, OpenClaw integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/runtime/watchdog/bridge-watchdog/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs/promises`, `node:path`
- **Internal relative modules** - `../../../integrations/linear/incident-manager.mjs`, `../../../integrations/notifications/openclaw-discord.mjs`, `../../../lib/logger.mjs`, `./activating-state-start.mjs`, `./catastrophic-patterns.mjs`, `./check-file-integrity.mjs`, `./check-health-endpoint.mjs`, `./check-interval-ms.mjs`, `./check-service.mjs`, `./detect-catastrophic-errors.mjs`, `./detect-rapid-restarts.mjs`, `./get-current-commit.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
