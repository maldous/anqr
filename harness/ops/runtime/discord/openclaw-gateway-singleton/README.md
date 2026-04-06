# OpenClaw Gateway Singleton

## 1. Directory Overview

This directory implements **OpenClaw Gateway Singleton** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 38 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **child-process.mjs** - Exports `childProcess`, `setChildProcess`, providing the reusable API for this directory concern.
- **cleanup-stale-lock.mjs** - Exports `cleanupStaleLock`, which implements cleanup stale lock.
- **cli.mjs** - Exports `CLI`, a shared constant used by sibling modules.
- **config-path.mjs** - Exports `CONFIG_PATH`, a shared constant used by sibling modules.
- **default-config.mjs** - Exports `DEFAULT_CONFIG`, a shared constant used by sibling modules.
- **ensure-lock-dir.mjs** - Exports `ensureLockDir`, which ensures lock dir.
- **follower-loop.mjs** - Exports `followerLoop`, which implements follower loop.
- **follower-sleep-ms.mjs** - Exports `FOLLOWER_SLEEP_MS`, a shared constant used by sibling modules.
- **handle-signal.mjs** - Exports `handleSignal`, which implements handle signal.
- **host.mjs** - Exports `HOST`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./worktree-id.mjs`, `./host.mjs`, `./port.mjs`, `./cli.mjs`, `./worktree-path.mjs`, `./default-config.mjs`, and 30 more siblings.
- **is-lock-still-ours.mjs** - Exports `isLockStillOurs`, which checks whether lock still ours.
- **is-pid-alive.mjs** - Exports `isPidAlive`, which checks whether pid alive.
- **is-port-listening.mjs** - Exports `isPortListening`, which checks whether port listening.
- **lock-dir.mjs** - Exports `LOCK_DIR`, a shared constant used by sibling modules.
- **lock-file.mjs** - Exports `LOCK_FILE`, a shared constant used by sibling modules.
- **lock-held.mjs** - Exports `lockHeld`, `setLockHeld`, providing the reusable API for this directory concern.
- **log-error.mjs** - Exports `logError`, which implements log error.
- **log-info.mjs** - Exports `logInfo`, which implements log info.
- **log-warn.mjs** - Exports `logWarn`, which implements log warn.
- **log.mjs** - Exports `log`, which implements log.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **monitor-external-gateway.mjs** - Exports `monitorExternalGateway`, which implements monitor external gateway.
- **port-check-interval-ms.mjs** - Exports `PORT_CHECK_INTERVAL_MS`, a shared constant used by sibling modules.
- **port.mjs** - Exports `PORT`, a shared constant used by sibling modules.
- **read-lock-info.mjs** - Exports `readLockInfo`, which reads lock info.
- **release-lock.mjs** - Exports `releaseLock`, which releases lock.
- **restart-backoff-ms.mjs** - Exports `RESTART_BACKOFF_MS`, a shared constant used by sibling modules.
- **run-gateway-owner-loop.mjs** - Exports `runGatewayOwnerLoop`, which runs gateway owner loop.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **sleep.mjs** - Exports `sleep`, which implements sleep.
- **spawn-gateway-process.mjs** - Exports `spawnGatewayProcess`, which implements spawn gateway process.
- **stopping.mjs** - Exports `setStopping`, `stopping`, providing the reusable API for this directory concern.
- **try-acquire-lock.mjs** - Exports `tryAcquireLock`, which implements try acquire lock.
- **wait-log-interval-ms.mjs** - Exports `WAIT_LOG_INTERVAL_MS`, a shared constant used by sibling modules.
- **worktree-id.mjs** - Exports `WORKTREE_ID`, a shared constant used by sibling modules.
- **worktree-path.mjs** - Exports `WORKTREE_PATH`, a shared constant used by sibling modules.
- **write-lock-metadata.mjs** - Exports `writeLockMetadata`, which writes lock metadata.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Discord integration, OpenClaw integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/runtime/discord/openclaw-gateway-singleton/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:net`, `node:os`, `node:path`
- **Internal relative modules** - `./child-process.mjs`, `./cleanup-stale-lock.mjs`, `./cli.mjs`, `./config-path.mjs`, `./default-config.mjs`, `./ensure-lock-dir.mjs`, `./follower-loop.mjs`, `./follower-sleep-ms.mjs`, `./host.mjs`, `./index.mjs`, `./is-lock-still-ours.mjs`, `./is-pid-alive.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
