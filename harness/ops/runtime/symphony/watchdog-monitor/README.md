# ANQR Watchdog Monitor

## 1. Directory Overview

This directory contains the watchdog monitoring system for the ANQR (Agentic Number Query Runner)
harness. It provides automated health monitoring for bridge services (Symphony and Codebuff), with
automatic rollback capabilities if bridges fail to become healthy after a restart. The watchdog
serves as a safety net to detect and recover from deployment issues that cause bridge service
failures. It currently contains 18 files and 0 subdirectories.

## 2. File Summaries

### Files

- **args.mjs** - Exports command line arguments array from `process.argv.slice(2)`.
- **bridge-arg.mjs** - Parses command line `--bridge=` argument. Options: `symphony`, `codebuff`, or `both` (default).
- **check-bridge-health.mjs** - Exports `checkBridgeHealth(port, name)` async function. Makes HTTP request to `/health` endpoint with 5 second timeout. Returns `true` if healthy, `false` otherwise. Logs provider count on success.
- **codebuff-port.mjs** - Exports `CODEBUFF_PORT = 4318`. The port where the Codebuff bridge health endpoint is available.
- **exec.mjs** - Safe shell command execution wrapper using `execSync`. Returns output string or `null` on error.
- **index.mjs** - Generated facade index that re-exports all public API members from the module.
- **log.mjs** - Logging wrapper that uses `logInfo` from logger.mjs. Exports `log(msg)` function.
- **logger.mjs** - Creates shared logger using `createLogger` from `../../../lib/logger.mjs`. Exports `logInfo`.
- **main.mjs** - Main orchestration logic. Exports `main()` async function. Checks bridge health, triggers rollback on failure, restarts bridges, and re-verifies health. Sends Discord notifications for all state transitions (success, recovery, failure).
- **restart-bridge.mjs** - Exports `restartBridge(name)` function. Restarts Symphony or Codebuff bridge service via `systemctl --user restart`. Service names: `anqr-symphony-bridge` or `anqr-codebuff-bridge`. Logs restart attempt with visual banner.
- **rollback-git.mjs** - Exports `rollbackGit()` async function. Performs automatic git rollback to previous commit (`HEAD~1`). Sends Discord embed notifications before and after rollback. Updates `MEMORY.md` with rollback details including timestamp, reason, commit hashes, and action taken. Returns `true` on successful verification.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes `main()` with error handling. Entry point for execution.
- **symphony-port.mjs** - Exports `SYMPHONY_PORT = 4319`. The port where the Symphony bridge health endpoint is available.
- **wait-for-bridge.mjs** - Exports `waitForBridge(port, name, timeoutMs)` async function. Polls bridge health every 2 seconds until healthy or timeout exceeded. Logs elapsed time on success or failure.
- **watchdog-enabled.mjs** - Exports `WATCHDOG_ENABLED` boolean, defaults to `true` (disabled if set to `"false"`). Controls whether the watchdog runs at all.
- **watchdog-rollback.mjs** - Exports `WATCHDOG_ROLLBACK` boolean, defaults to `true` (disabled if set to `"false"`). Controls whether automatic git rollback is attempted on failure.
- **watchdog-timeout-ms.mjs** - Exports `WATCHDOG_TIMEOUT_MS` from environment variable, defaults to `60000` (60 seconds). Maximum time to wait for bridge to become healthy.
- **worktree-id.mjs** - Exports `WORKTREE_ID` from environment variable `ANQR_WORKTREE_ID`, defaults to `"main"`. Identifies the worktree running this watchdog instance.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/runtime/symphony/watchdog-monitor/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
