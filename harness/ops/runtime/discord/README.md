# ANQR Discord Runtime

## 1. Directory Overview

This directory contains the Discord runtime integration for the ANQR (Agentic Number Query Runner) harness. It manages the OpenClaw Discord gateway process using a singleton pattern that ensures only one gateway process runs across multiple worktree runners through file-based locking with a follower/owner pattern.

## 2. File Summaries

### Facade Module

- **openclaw-gateway-singleton.mjs** - Auto-generated facade that re-exports from `./openclaw-gateway-singleton/index.mjs` and `./openclaw-gateway-singleton/runtime.mjs`. This decomposition pattern maintains backwards compatibility by providing a single entry point that delegates to the sibling modules. Provides the entry point for the OpenClaw gateway singleton wrapper.

### Subdirectory

- **openclaw-gateway-singleton/** - Contains the core implementation:
  - **Configuration**: worktree-id.mjs, worktree-path.mjs, host.mjs, port.mjs, cli.mjs, default-config.mjs, config-path.mjs, lock-dir.mjs, lock-file.mjs, and various timing constants (follower-sleep-ms.mjs, restart-backoff-ms.mjs, port-check-interval-ms.mjs, wait-log-interval-ms.mjs)
  - **State Management**: lock-held.mjs, stopping.mjs, child-process.mjs
  - **Logging**: log.mjs, log-info.mjs, log-warn.mjs, log-error.mjs
  - **Utilities**: sleep.mjs, is-pid-alive.mjs, is-port-listening.mjs, ensure-lock-dir.mjs
  - **Lock Management**: try-acquire-lock.mjs, release-lock.mjs, read-lock-info.mjs, write-lock-metadata.mjs, cleanup-stale-lock.mjs, is-lock-still-ours.mjs
  - **Gateway Lifecycle**: spawn-gateway-process.mjs, run-gateway-owner-loop.mjs, monitor-external-gateway.mjs, follower-loop.mjs
  - **Main Entry Points**: main.mjs, handle-signal.mjs, runtime.mjs, index.mjs

## 3. Overall Directory Function

This directory implements a singleton gateway wrapper that ensures exactly one OpenClaw Discord gateway process runs across all worktree runners. The system works as follows:

1. **Leader Election**: Runners attempt to acquire an exclusive file lock. The first to succeed becomes the owner.
2. **Owner Loop**: The owner spawns the OpenClaw gateway process and monitors it. If the gateway exits, it restarts with exponential backoff.
3. **Follower Loop**: Runners that cannot acquire the lock enter follower mode, periodically checking if the lock has been released.
4. **External Gateway Detection**: If the gateway port is already in use, the owner monitors the external gateway instead of spawning its own.
5. **Stale Lock Cleanup**: If the lock owner processes are dead, stale locks are automatically cleaned up.
6. **Graceful Shutdown**: SIGTERM, SIGINT, and SIGHUP signals are handled to cleanly shut down the gateway.

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