# Watchdog Monitor

## Purpose

Watchdog Monitor contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 18 immediate files
- 0 child directories

## Key Files

- `args.mjs` - Exports `args`, a shared constant or state value used by sibling modules.
- `bridge-arg.mjs` - Exports `bridgeArg`, a shared constant or state value used by sibling modules.
- `check-bridge-health.mjs` - Exports `checkBridgeHealth`, the main helper defined in this file.
- `codebuff-port.mjs` - Exports `CODEBUFF_PORT`, a shared constant or state value used by sibling modules.
- `exec.mjs` - Exports `exec`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `log.mjs` - Exports `log`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `quarantine-worktree.mjs` - Exports `quarantineWorktree`, the main helper defined in this file.
- `restart-bridge.mjs` - Exports `restartBridge`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `symphony-port.mjs` - Exports `SYMPHONY_PORT`, a shared constant or state value used by sibling modules.
- `wait-for-bridge.mjs` - Exports `waitForBridge`, the main helper defined in this file.
- `watchdog-enabled.mjs` - Exports `WATCHDOG_ENABLED`, a shared constant or state value used by sibling modules.
- `watchdog-rollback.mjs` - Exports `WATCHDOG_ROLLBACK`, a shared constant or state value used by sibling modules.
- `watchdog-timeout-ms.mjs` - Exports `WATCHDOG_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `worktree-id.mjs` - Exports `WORKTREE_ID`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 18 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
