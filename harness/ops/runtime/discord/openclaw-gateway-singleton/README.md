# OpenClaw Gateway Singleton

## 1. Directory Overview

This directory implements a singleton pattern for managing the OpenClaw Discord gateway process across multiple worktree runners. It ensures that only one gateway process runs at a time by using file-based locking with a follower/owner pattern. When one runner acquires the lock and spawns the gateway, other runners monitor the lock and wait until it is released before attempting to become the owner themselves.

## 2. File Summaries

### Configuration & Constants

- **worktree-id.mjs** - Exports `WORKTREE_ID` from `ANQR_WORKTREE_ID` environment variable, defaults to "main"
- **worktree-path.mjs** - Exports `WORKTREE_PATH` from `ANQR_WORKTREE_PATH` environment variable or current working directory
- **host.mjs** - Exports `HOST` from `OPENCLAW_GATEWAY_HOST` environment variable, defaults to "127.0.0.1"
- **port.mjs** - Exports `PORT` from `OPENCLAW_GATEWAY_PORT` environment variable, defaults to 18789
- **cli.mjs** - Exports `CLI` from `OPENCLAW_CLI` environment variable, defaults to "openclaw"
- **default-config.mjs** - Exports default config path as `{WORKTREE_PATH}/.openclaw/openclaw.json`
- **config-path.mjs** - Exports `CONFIG_PATH` from `OPENCLAW_CONFIG_PATH` or default config
- **lock-dir.mjs** - Exports `LOCK_DIR` from `OPENCLAW_LOCK_DIR` or `~/.cache/anqr-openclaw`
- **lock-file.mjs** - Exports `LOCK_FILE` as `{LOCK_DIR}/gateway.lock`
- **follower-sleep-ms.mjs** - Exports `FOLLOWER_SLEEP_MS` (default 5000ms)
- **restart-backoff-ms.mjs** - Exports `RESTART_BACKOFF_MS` (default 15000ms)
- **port-check-interval-ms.mjs** - Exports `PORT_CHECK_INTERVAL_MS` (default 30000ms)
- **wait-log-interval-ms.mjs** - Exports `WAIT_LOG_INTERVAL_MS` (default 60000ms)

### State Management

- **lock-held.mjs** - Exports `lockHeld` boolean and `setLockHeld(value)` function
- **stopping.mjs** - Exports `stopping` boolean and `setStopping(value)` function
- **child-process.mjs** - Exports `childProcess` reference and `setChildProcess(value)` function

### Logging

- **log.mjs** - Core logging function with timestamp and worktree ID prefix
- **log-info.mjs** - Exports `logInfo(msg)` for INFO level logging
- **log-warn.mjs** - Exports `logWarn(msg)` for WARN level logging
- **log-error.mjs** - Exports `logError(msg)` for ERROR level logging

### Utilities

- **sleep.mjs** - Exports `sleep(ms)` promise-based delay function
- **is-pid-alive.mjs** - Exports `isPidAlive(pid)` to check if process ID is alive
- **is-port-listening.mjs** - Exports `isPortListening(host, port)` to check TCP port availability
- **ensure-lock-dir.mjs** - Exports `ensureLockDir()` to create lock directory recursively

### Lock Management

- **try-acquire-lock.mjs** - Exports `tryAcquireLock()` - attempts to acquire exclusive lock file
- **release-lock.mjs** - Exports `releaseLock()` - releases the lock and deletes lock file
- **read-lock-info.mjs** - Exports `readLockInfo()` - reads JSON metadata from lock file
- **write-lock-metadata.mjs** - Exports `writeLockMetadata(extra?)` - writes worktree, PID, timestamp to lock file
- **cleanup-stale-lock.mjs** - Exports `cleanupStaleLock()` - removes lock if owner processes are dead
- **is-lock-still-ours.mjs** - Exports `isLockStillOurs()` - verifies lock ownership by PID

### Gateway Lifecycle

- **spawn-gateway-process.mjs** - Exports `spawnGatewayProcess()` - spawns OpenClaw gateway as child process
- **run-gateway-owner-loop.mjs** - Exports `runGatewayOwnerLoop()` - owner loop that manages gateway process
- **monitor-external-gateway.mjs** - Exports `monitorExternalGateway()` - monitors existing gateway until it exits
- **follower-loop.mjs** - Exports `followerLoop()` - follower loop that waits for lock availability

### Main Entry Points

- **main.mjs** - Exports `main()` - ensures lock directory exists and runs follower loop
- **handle-signal.mjs** - Exports `handleSignal(signal)` - graceful shutdown handler
- **runtime.mjs** - Generated runtime carry-forward that sets up signal handlers and calls main()
- **index.mjs** - Generated facade index that re-exports all public API members

## 3. Overall Directory Function

This directory implements a singleton gateway wrapper that ensures exactly one OpenClaw Discord gateway process runs across all worktree runners. The system works as follows:

1. **Leader Election**: Runners attempt to acquire an exclusive file lock. The first to succeed becomes the owner.
2. **Owner Loop**: The owner spawns the OpenClaw gateway process and monitors it. If the gateway exits, it restarts with exponential backoff.
3. **Follower Loop**: Runners that cannot acquire the lock enter follower mode, periodically checking if the lock has been released.
4. **External Gateway Detection**: If the gateway port is already in use, the owner monitors the external gateway instead of spawning its own.
5. **Stale Lock Cleanup**: If the lock owner processes are dead, stale locks are automatically cleaned up.
6. **Graceful Shutdown**: SIGTERM, SIGINT, and SIGHUP signals are handled to cleanly shut down the gateway.

The lock file stores metadata (worktree ID, runner PID, gateway PID, timestamp) for debugging and stale lock detection.

## 4. Usage Instructions

This directory is typically not run directly. Instead, it provides the singleton wrapper imported by other harness modules. However, it can be executed directly for testing:

```bash
# Run the gateway singleton wrapper
node ops/runtime/discord/openclaw-gateway-singleton/runtime.mjs

# Or via the facade
node ops/runtime/discord/openclaw-gateway-singleton/index.mjs
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANQR_WORKTREE_ID` | "main" | Identifier for this worktree |
| `ANQR_WORKTREE_PATH` | cwd | Path to worktree directory |
| `OPENCLAW_GATEWAY_HOST` | "127.0.0.1" | Gateway bind host |
| `OPENCLAW_GATEWAY_PORT` | 18789 | Gateway bind port |
| `OPENCLAW_CLI` | "openclaw" | OpenClaw CLI command |
| `OPENCLAW_CONFIG_PATH` | (default) | Path to OpenClaw config |
| `OPENCLAW_LOCK_DIR` | ~/.cache/anqr-openclaw | Lock file directory |
| `OPENCLAW_FOLLOWER_SLEEP_MS` | 5000 | Follower check interval |
| `OPENCLAW_RESTART_BACKOFF_MS` | 15000 | Gateway restart backoff |
| `OPENCLAW_PORT_CHECK_INTERVAL_MS` | 30000 | External gateway check interval |
| `OPENCLAW_WAIT_LOG_INTERVAL_MS` | 60000 | Wait log interval |

### Lock File Format

The lock file at `{LOCK_DIR}/gateway.lock` contains JSON:

```json
{
  "worktree": "worktree-id",
  "runnerPid": 12345,
  "gatewayPid": 12346,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 5. Dependencies

### Internal Dependencies

- Node.js built-in modules: `child_process`, `fs`, `net`, `os`, `path`

### External Requirements

- **OpenClaw CLI** - Must be installed and accessible via `OPENCLAW_CLI` or "openclaw" command
- **.openclaw/openclaw.json** - Configuration file in worktree directory

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Write access to lock directory (~/.cache/anqr-openclaw by default)
- TCP port 18789 (or configured port) must be available

## 6. Additional Comments

- **Config Limitation**: This OpenClaw build reads `.openclaw/openclaw.json` from the working directory and does not support `--config` CLI flags. The gateway is pinned to the selected worktree by running from that worktree path.

- **Bonjour/Advertiser Disabled**: The wrapper explicitly disables Bonjour service discovery and advertiser to prevent port conflicts: `OPENCLAW_DISABLE_BONJOUR=1`, `OPENCLAW_BONJOUR_MODE=off`, `OPENCLAW_DISABLE_ADVERTISER=1`, `OPENCLAW_GATEWAY_ADVERTISE=off`.

- **Stale Lock Detection**: If both the runner and gateway processes are dead, the lock file is automatically removed on next check, allowing another runner to acquire ownership.

- **Lock Ownership Verification**: Before critical operations, runners verify they still own the lock by checking their PID matches the lock file's `runnerPid`, preventing actions on locks taken by other runners.

- **Random Jitter**: Follower sleep and restart backoff include random jitter (0-2000ms and 0-5000ms respectively) to reduce thundering herd when many runners compete for the lock.