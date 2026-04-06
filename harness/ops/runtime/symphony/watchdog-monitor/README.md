# ANQR Watchdog Monitor

## 1. Directory Overview

This directory implements **ANQR Watchdog Monitor** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 18 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **args.mjs** - Exports `args`, which implements args.
- **bridge-arg.mjs** - Exports `bridgeArg`, which implements bridge arg.
- **check-bridge-health.mjs** - Exports `checkBridgeHealth`, which checks bridge health.
- **codebuff-port.mjs** - Exports `CODEBUFF_PORT`, a shared constant used by sibling modules.
- **exec.mjs** - Exports `exec`, which implements exec.
- **index.mjs** - Facade module that re-exports public members from `./watchdog-enabled.mjs`, `./watchdog-timeout-ms.mjs`, `./watchdog-rollback.mjs`, `./symphony-port.mjs`, `./codebuff-port.mjs`, `./worktree-id.mjs`, and 9 more siblings.
- **log.mjs** - Exports `log`, which implements log.
- **logger.mjs** - Shared logging helper module exporting `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **restart-bridge.mjs** - Exports `restartBridge`, which implements restart bridge.
- **rollback-git.mjs** - Exports `rollbackGit`, which implements rollback git.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **symphony-port.mjs** - Exports `SYMPHONY_PORT`, a shared constant used by sibling modules.
- **wait-for-bridge.mjs** - Exports `waitForBridge`, which implements wait for bridge.
- **watchdog-enabled.mjs** - Exports `WATCHDOG_ENABLED`, a shared constant used by sibling modules.
- **watchdog-rollback.mjs** - Exports `WATCHDOG_ROLLBACK`, a shared constant used by sibling modules.
- **watchdog-timeout-ms.mjs** - Exports `WATCHDOG_TIMEOUT_MS`, a shared constant used by sibling modules.
- **worktree-id.mjs** - Exports `WORKTREE_ID`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Discord integration, OpenClaw integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/runtime/symphony/watchdog-monitor/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`
- **Internal relative modules** - `../../../integrations/notifications/openclaw-discord.mjs`, `../../../lib/logger.mjs`, `./args.mjs`, `./bridge-arg.mjs`, `./check-bridge-health.mjs`, `./codebuff-port.mjs`, `./exec.mjs`, `./index.mjs`, `./log.mjs`, `./logger.mjs`, `./restart-bridge.mjs`, `./rollback-git.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
