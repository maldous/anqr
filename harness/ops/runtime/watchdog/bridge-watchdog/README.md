# Bridge Watchdog

## Purpose
Bridge Watchdog contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 41 immediate files
- 1 child directory

## Key Files
- `activating-state-start.mjs` - Exports `activatingStateStart`, a shared constant or state value used by sibling modules.
- `catastrophic-patterns.mjs` - Exports `CATASTROPHIC_PATTERNS`, a shared constant or state value used by sibling modules.
- `check-file-integrity.mjs` - Exports `checkFileIntegrity`, the main helper defined in this file.
- `check-health-endpoint.mjs` - Exports `checkHealthEndpoint`, the main helper defined in this file.
- `check-interval-ms.mjs` - Exports `CHECK_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `check-service.mjs` - Exports `checkService`, the main helper defined in this file.
- `detect-catastrophic-errors.mjs` - Exports `detectCatastrophicErrors`, the main helper defined in this file.
- `detect-rapid-restarts.mjs` - Exports `detectRapidRestarts`, the main helper defined in this file.
- `get-current-commit.mjs` - Exports `getCurrentCommit`, the main helper defined in this file.
- `get-service-active-time.mjs` - Exports `getServiceActiveTime`, the main helper defined in this file.
- `get-service-journal.mjs` - Exports `getServiceJournal`, the main helper defined in this file.
- `get-service-pid.mjs` - Exports `getServicePID`, the main helper defined in this file.
- `get-service-status.mjs` - Exports `getServiceStatus`, the main helper defined in this file.
- `health-check-timeout-ms.mjs` - Exports `HEALTH_CHECK_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-in-cooldown.mjs` - Exports `isInCooldown`, the main helper defined in this file.
- `is-transient-error.mjs` - Exports `isTransientError`, the main helper defined in this file.
- `last-recovery-action.mjs` - Exports `lastRecoveryAction`, a shared constant or state value used by sibling modules.
- `last-trigger-rate-alert.mjs` - Exports `setLastTriggerRateAlert`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `monitor-loop.mjs` - Exports `monitorLoop`, the main helper defined in this file.
- `monitored-services.mjs` - Exports `MONITORED_SERVICES`, a shared constant or state value used by sibling modules.
- `quarantine-and-restart.mjs` - Re-export facade that assembles the public surface for this directory.
- `rapid-restart-history.mjs` - Exports `rapidRestartHistory`, a shared constant or state value used by sibling modules.
- `rapid-restart-threshold.mjs` - Exports `RAPID_RESTART_THRESHOLD`, a shared constant or state value used by sibling modules.
- `rapid-restart-window-ms.mjs` - Exports `RAPID_RESTART_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `recovery-cooldown-ms.mjs` - Exports `RECOVERY_COOLDOWN_MS`, a shared constant or state value used by sibling modules.
- `restart-timestamps.mjs` - Exports `restartTimestamps`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `shutdown.mjs` - Exports `shutdown`, the main helper defined in this file.
- `shutting-down.mjs` - Exports `setShuttingDown`, the main helper defined in this file.
- `startup-grace-period-ms.mjs` - Exports `STARTUP_GRACE_PERIOD_MS`, a shared constant or state value used by sibling modules.
- `track-watchdog-trigger.mjs` - Exports `trackWatchdogTrigger`, the main helper defined in this file.
- `transient-patterns.mjs` - Exports `TRANSIENT_PATTERNS`, a shared constant or state value used by sibling modules.
- `trigger-rate-alert-cooldown-ms.mjs` - Exports `TRIGGER_RATE_ALERT_COOLDOWN_MS`, a shared constant or state value used by sibling modules.
- `trigger-rate-threshold.mjs` - Exports `TRIGGER_RATE_THRESHOLD`, a shared constant or state value used by sibling modules.
- `trigger-rate-window-ms.mjs` - Exports `TRIGGER_RATE_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `update-memory.mjs` - Exports `updateMemory`, the main helper defined in this file.
- `verify-and-notify-recovery.mjs` - Exports `verifyAndNotifyRecovery`, the main helper defined in this file.
- `watchdog-trigger-history.mjs` - Exports `watchdogTriggerHistory`, a shared constant or state value used by sibling modules.
- `worktree-id.mjs` - Exports `WORKTREE_ID`, a shared constant or state value used by sibling modules.

## Subdirectories
- `quarantine-and-restart/` - Quarantine And Restart scope; immediate files include `index.mjs`, `quarantine-and-restart.mjs`, `write-evidence-record.mjs`.

## Operational Notes
- Current on-disk inventory: 41 immediate file(s) and 1 child directory.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
