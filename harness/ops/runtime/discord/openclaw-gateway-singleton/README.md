# Openclaw Gateway Singleton

## Purpose
Openclaw Gateway Singleton contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 38 immediate files
- 0 child directories

## Key Files

- `child-process.mjs` - Exports `setChildProcess`, the main helper defined in this file.
- `cleanup-stale-lock.mjs` - Exports `cleanupStaleLock`, the main helper defined in this file.
- `cli.mjs` - Exports `CLI`, a shared constant or state value used by sibling modules.
- `config-path.mjs` - Exports `CONFIG_PATH`, a shared constant or state value used by sibling modules.
- `default-config.mjs` - Exports `DEFAULT_CONFIG`, a shared constant or state value used by sibling modules.
- `ensure-lock-dir.mjs` - Exports `ensureLockDir`, the main helper defined in this file.
- `follower-loop.mjs` - Exports `followerLoop`, the main helper defined in this file.
- `follower-sleep-ms.mjs` - Exports `FOLLOWER_SLEEP_MS`, a shared constant or state value used by sibling modules.
- `handle-signal.mjs` - Exports `handleSignal`, the main helper defined in this file.
- `host.mjs` - Exports `HOST`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-lock-still-ours.mjs` - Exports `isLockStillOurs`, the main helper defined in this file.
- `is-pid-alive.mjs` - Exports `isPidAlive`, the main helper defined in this file.
- `is-port-listening.mjs` - Exports `isPortListening`, the main helper defined in this file.
- `lock-dir.mjs` - Exports `LOCK_DIR`, a shared constant or state value used by sibling modules.
- `lock-file.mjs` - Exports `LOCK_FILE`, a shared constant or state value used by sibling modules.
- `lock-held.mjs` - Exports `setLockHeld`, the main helper defined in this file.
- `log-error.mjs` - Exports `logError`, a shared constant or state value used by sibling modules.
- `log-info.mjs` - Exports `logInfo`, a shared constant or state value used by sibling modules.
- `log-warn.mjs` - Exports `logWarn`, a shared constant or state value used by sibling modules.
- `log.mjs` - Exports `log`, the main helper defined in this file.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `monitor-external-gateway.mjs` - Exports `monitorExternalGateway`, the main helper defined in this file.
- `port-check-interval-ms.mjs` - Exports `PORT_CHECK_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `port.mjs` - Exports `PORT`, a shared constant or state value used by sibling modules.
- `read-lock-info.mjs` - Exports `readLockInfo`, the main helper defined in this file.
- `release-lock.mjs` - Exports `releaseLock`, the main helper defined in this file.
- `restart-backoff-ms.mjs` - Exports `RESTART_BACKOFF_MS`, a shared constant or state value used by sibling modules.
- `run-gateway-owner-loop.mjs` - Exports `runGatewayOwnerLoop`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `sleep.mjs` - Exports `sleep`, the main helper defined in this file.
- `spawn-gateway-process.mjs` - Exports `spawnGatewayProcess`, the main helper defined in this file.
- `stopping.mjs` - Exports `setStopping`, the main helper defined in this file.
- `try-acquire-lock.mjs` - Exports `tryAcquireLock`, the main helper defined in this file.
- `wait-log-interval-ms.mjs` - Exports `WAIT_LOG_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `worktree-id.mjs` - Exports `WORKTREE_ID`, a shared constant or state value used by sibling modules.
- `worktree-path.mjs` - Exports `WORKTREE_PATH`, a shared constant or state value used by sibling modules.
- `write-lock-metadata.mjs` - Exports `writeLockMetadata`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 38 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
