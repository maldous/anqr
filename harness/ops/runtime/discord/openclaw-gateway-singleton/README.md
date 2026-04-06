# OpenClaw Gateway Singleton

## 1. Directory Overview

This directory implements a singleton pattern for managing the OpenClaw Discord gateway process
across multiple worktree runners. It ensures that only one gateway process runs at a time by using
file-based locking with a follower/owner pattern. When one runner acquires the lock and spawns the
gateway, other runners monitor the lock and wait until it is released before attempting to become
the owner themselves. It currently contains 38 files and 0 subdirectories.

## 2. File Summaries

### Files

- **child-process.mjs** - Exports `childProcess` reference and `setChildProcess(value)` function
- **cleanup-stale-lock.mjs** - Exports `cleanupStaleLock()` - removes lock if owner processes are dead
- **cli.mjs** - Exports `CLI` from `OPENCLAW_CLI` environment variable, defaults to "openclaw"
- **config-path.mjs** - Exports `CONFIG_PATH` from `OPENCLAW_CONFIG_PATH` or default config
- **default-config.mjs** - Exports default config path as `{WORKTREE_PATH}/.openclaw/openclaw.json`
- **ensure-lock-dir.mjs** - Exports `ensureLockDir()` to create lock directory recursively
- **follower-loop.mjs** - Exports `followerLoop()` - follower loop that waits for lock availability
- **follower-sleep-ms.mjs** - Exports `FOLLOWER_SLEEP_MS` (default 5000ms)
- **handle-signal.mjs** - Exports `handleSignal(signal)` - graceful shutdown handler
- **host.mjs** - Exports `HOST` from `OPENCLAW_GATEWAY_HOST` environment variable, defaults to "127.0.0.1"
- **index.mjs** - Generated facade index that re-exports all public API members
- **is-lock-still-ours.mjs** - Exports `isLockStillOurs()` - verifies lock ownership by PID
- **is-pid-alive.mjs** - Exports `isPidAlive(pid)` to check if process ID is alive
- **is-port-listening.mjs** - Exports `isPortListening(host, port)` to check TCP port availability
- **lock-dir.mjs** - Exports `LOCK_DIR` from `OPENCLAW_LOCK_DIR` or `~/.cache/anqr-openclaw`
- **lock-file.mjs** - Exports `LOCK_FILE` as `{LOCK_DIR}/gateway.lock`
- **lock-held.mjs** - Exports `lockHeld` boolean and `setLockHeld(value)` function
- **log-error.mjs** - Exports `logError(msg)` for ERROR level logging
- **log-info.mjs** - Exports `logInfo(msg)` for INFO level logging
- **log-warn.mjs** - Exports `logWarn(msg)` for WARN level logging
- **log.mjs** - Core logging function with timestamp and worktree ID prefix
- **main.mjs** - Exports `main()` - ensures lock directory exists and runs follower loop
- **monitor-external-gateway.mjs** - Exports `monitorExternalGateway()` - monitors existing gateway until it exits
- **port-check-interval-ms.mjs** - Exports `PORT_CHECK_INTERVAL_MS` (default 30000ms)
- **port.mjs** - Exports `PORT` from `OPENCLAW_GATEWAY_PORT` environment variable, defaults to 18789
- **read-lock-info.mjs** - Exports `readLockInfo()` - reads JSON metadata from lock file
- **release-lock.mjs** - Exports `releaseLock()` - releases the lock and deletes lock file
- **restart-backoff-ms.mjs** - Exports `RESTART_BACKOFF_MS` (default 15000ms)
- **run-gateway-owner-loop.mjs** - Exports `runGatewayOwnerLoop()` - owner loop that manages gateway process
- **runtime.mjs** - Generated runtime carry-forward that sets up signal handlers and calls main()
- **sleep.mjs** - Exports `sleep(ms)` promise-based delay function
- **spawn-gateway-process.mjs** - Exports `spawnGatewayProcess()` - spawns OpenClaw gateway as child process
- **stopping.mjs** - Exports `stopping` boolean and `setStopping(value)` function
- **try-acquire-lock.mjs** - Exports `tryAcquireLock()` - attempts to acquire exclusive lock file
- **wait-log-interval-ms.mjs** - Exports `WAIT_LOG_INTERVAL_MS` (default 60000ms)
- **worktree-id.mjs** - Exports `WORKTREE_ID` from `ANQR_WORKTREE_ID` environment variable, defaults to "main"
- **worktree-path.mjs** - Exports `WORKTREE_PATH` from `ANQR_WORKTREE_PATH` environment variable or current working directory
- **write-lock-metadata.mjs** - Exports `writeLockMetadata(extra?)` - writes worktree, PID, timestamp to lock file

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/runtime/discord/openclaw-gateway-singleton/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
