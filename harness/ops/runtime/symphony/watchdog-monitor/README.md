# ANQR Watchdog Monitor

## 1. Directory Overview

This directory contains the watchdog monitoring system for the ANQR (Agentic Number Query Runner) harness. It provides automated health monitoring for bridge services (Symphony and Codebuff), with automatic rollback capabilities if bridges fail to become healthy after a restart. The watchdog serves as a safety net to detect and recover from deployment issues that cause bridge service failures.

## 2. File Summaries

### Configuration Files

- **worktree-id.mjs** - Exports `WORKTREE_ID` from environment variable `ANQR_WORKTREE_ID`, defaults to `"main"`. Identifies the worktree running this watchdog instance.

- **symphony-port.mjs** - Exports `SYMPHONY_PORT = 4319`. The port where the Symphony bridge health endpoint is available.

- **codebuff-port.mjs** - Exports `CODEBUFF_PORT = 4318`. The port where the Codebuff bridge health endpoint is available.

- **watchdog-timeout-ms.mjs** - Exports `WATCHDOG_TIMEOUT_MS` from environment variable, defaults to `60000` (60 seconds). Maximum time to wait for bridge to become healthy.

- **watchdog-enabled.mjs** - Exports `WATCHDOG_ENABLED` boolean, defaults to `true` (disabled if set to `"false"`). Controls whether the watchdog runs at all.

- **watchdog-rollback.mjs** - Exports `WATCHDOG_ROLLBACK` boolean, defaults to `true` (disabled if set to `"false"`). Controls whether automatic git rollback is attempted on failure.

- **bridge-arg.mjs** - Parses command line `--bridge=` argument. Options: `symphony`, `codebuff`, or `both` (default).

- **args.mjs** - Exports command line arguments array from `process.argv.slice(2)`.

### Utility Modules

- **logger.mjs** - Creates shared logger using `createLogger` from `../../../lib/logger.mjs`. Exports `logInfo`.

- **log.mjs** - Logging wrapper that uses `logInfo` from logger.mjs. Exports `log(msg)` function.

- **exec.mjs** - Safe shell command execution wrapper using `execSync`. Returns output string or `null` on error.

### Health Monitoring

- **check-bridge-health.mjs** - Exports `checkBridgeHealth(port, name)` async function. Makes HTTP request to `/health` endpoint with 5 second timeout. Returns `true` if healthy, `false` otherwise. Logs provider count on success.

- **wait-for-bridge.mjs** - Exports `waitForBridge(port, name, timeoutMs)` async function. Polls bridge health every 2 seconds until healthy or timeout exceeded. Logs elapsed time on success or failure.

### Recovery Actions

- **restart-bridge.mjs** - Exports `restartBridge(name)` function. Restarts Symphony or Codebuff bridge service via `systemctl --user restart`. Service names: `anqr-symphony-bridge` or `anqr-codebuff-bridge`. Logs restart attempt with visual banner.

- **rollback-git.mjs** - Exports `rollbackGit()` async function. Performs automatic git rollback to previous commit (`HEAD~1`). Sends Discord embed notifications before and after rollback. Updates `MEMORY.md` with rollback details including timestamp, reason, commit hashes, and action taken. Returns `true` on successful verification.

### Main Entry Points

- **index.mjs** - Generated facade index that re-exports all public API members from the module.

- **main.mjs** - Main orchestration logic. Exports `main()` async function. Checks bridge health, triggers rollback on failure, restarts bridges, and re-verifies health. Sends Discord notifications for all state transitions (success, recovery, failure).

- **runtime.mjs** - Generated runtime carry-forward that imports and executes `main()` with error handling. Entry point for execution.

## 3. Overall Directory Function

This directory provides an automated safety net for the ANQR harness bridge services. The watchdog monitors the health of both Symphony (port 4319) and Codebuff (port 4318) bridges after deployment or restart. If a bridge fails to become healthy within the configured timeout, the watchdog triggers an automatic git rollback to the previous commit and restarts the bridge services with the known-good code.

The workflow: `main.mjs` checks bridge health using `waitForBridge`. If all bridges are healthy, it exits successfully. If any bridge fails, it calls `rollbackGit()` to revert to the previous commit, then `restartBridge()` for each failed bridge, waits 10 seconds, and re-verifies health. On success, it logs recovery and sends a success notification. On continued failure, it logs critical failure and sends an alert notification requiring manual intervention.

Key features:
- Configurable bridge selection (symphony, codebuff, or both)
- Configurable timeout and rollback behavior via environment variables
- Discord notifications for all state transitions
- MEMORY.md logging for audit trail
- Visual banners for critical operations in console output

## 4. Usage Instructions

### Running the Watchdog

```bash
# From harness root
node ops/runtime/symphony/watchdog-monitor/runtime.mjs
```

### Optional Arguments

```bash
# Monitor only Symphony bridge
node ops/runtime/symphony/watchdog-monitor/runtime.mjs --bridge=symphony

# Monitor only Codebuff bridge
node ops/runtime/symphony/watchdog-monitor/runtime.mjs --bridge=codebuff

# Monitor both bridges (default)
node ops/runtime/symphony/watchdog-monitor/runtime.mjs --bridge=both
```

### Environment Variables

```bash
# Disable watchdog entirely
WATCHDOG_ENABLED=false node ops/runtime/symphony/watchdog-monitor/runtime.mjs

# Disable automatic rollback (watchdog will fail without rolling back)
WATCHDOG_ROLLBACK=false node ops/runtime/symphony/watchdog-monitor/runtime.mjs

# Set custom timeout (120 seconds)
WATCHDOG_TIMEOUT_MS=120000 node ops/runtime/symphony/watchdog-monitor/runtime.mjs

# Set worktree identifier
ANQR_WORKTREE_ID=feature-xyz node ops/runtime/symphony/watchdog-monitor/runtime.mjs
```

### Exit Codes

- `0` - Success (all monitored bridges healthy, or successful recovery after rollback)
- `1` - Failure (bridge health check failed and rollback failed, or rollback didn't fix the issue)

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Logger factory for consistent logging
- **../../../integrations/notifications/openclaw-discord.mjs** - Discord webhook notifications

### External Services

- **systemd** - For bridge service restarts via `systemctl --user`
- **Discord** - For alert and status notifications via webhooks

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Running bridge services on ports 4318 (Codebuff) and/or 4319 (Symphony)
- Discord webhook configured for notifications (optional, failures are logged if unavailable)

## 6. Additional Comments

- **Fail-Safe Design**: The watchdog is designed to be conservative. It will not proceed to restart bridges until rollback is verified. If rollback verification fails, the watchdog exits with code 1 requiring manual intervention.

- **Visual Clarity**: Critical operations (restart, rollback, recovery) use ASCII art banners in console output to make automated monitoring output obvious in logs.

- **Notification Strategy**: Discord notifications are sent at key points: rollback initiated, rollback success, recovery success, and recovery failure. Errors in notification sending are logged but don't fail the operation.

- **MEMORY.md Audit Trail**: Every rollback appends a detailed entry to `MEMORY.md` with timestamp, commit hashes, reason, and action taken. This creates a persistent audit trail of watchdog events.

- **Timing**: Default timeout of 60 seconds allows reasonable time for bridge services to initialize. The 10-second post-restart wait gives services time to start before re-verification.

- **Environment Variable Convention**: Booleans are disabled when set to `"false"` string, otherwise enabled. This allows environment variable configuration without needing explicit `true` values.