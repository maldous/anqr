# ANQR Symphony Agent Router

## 1. Directory Overview

This directory implements **ANQR Symphony Agent Router** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. Linear triggers are dispatched directly to worktree executor HTTP endpoints rather than spawning legacy runner entrypoints. The current inventory is 24 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **global-active-requests.mjs** - Exports `globalActiveRequests`, `setGlobalActiveRequests`, providing the reusable API for this directory concern.
- **handle-linear-queue.mjs** - Exports `handleLinearQueue`, which implements handle linear queue.
- **handle-linear-trigger.mjs** - Exports `handleLinearTrigger`, which implements handle linear trigger.
- **index.mjs** - Facade module that re-exports public members from `./port.mjs`, `./worktree-ids.mjs`, `./max-concurrent.mjs`, `./target-host.mjs`, `./worktrees.mjs`, `./global-active-requests.mjs`, and 15 more siblings.
- **is-path-within-root.mjs** - Exports `isPathWithinRoot`, which checks whether path within root.
- **json.mjs** - Exports `json`, which implements json.
- **linear-queue.mjs** - Exports `linearQueue`, an initially empty array used by sibling modules.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **max-concurrent.mjs** - Exports `MAX_CONCURRENT`, a shared constant used by sibling modules.
- **max-queue-age-ms.mjs** - Exports `MAX_QUEUE_AGE_MS`, a shared constant used by sibling modules.
- **max-queue-length.mjs** - Exports `MAX_QUEUE_LENGTH`, a shared constant used by sibling modules.
- **overload.mjs** - Exports `overload`, which implements overload.
- **port.mjs** - Exports `PORT`, a shared constant used by sibling modules.
- **proxy-request.mjs** - Exports `proxyRequest`, which implements proxy request.
- **queue-poll-interval-ms.mjs** - Exports `QUEUE_POLL_INTERVAL_MS`, a shared constant used by sibling modules.
- **rebase-cwd-to-worktree.mjs** - Exports `rebaseCwdToWorktree`, which implements rebase cwd to worktree.
- **round-robin-index.mjs** - Exports `roundRobinIndex`, `setRoundRobinIndex`, providing the reusable API for this directory concern.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **select-worktree.mjs** - Exports `selectWorktree`, which implements select worktree.
- **server.mjs** - Exports `server`, which implements server.
- **dispatch-linear-execution.mjs** - Exports `dispatchLinearExecution`, which dispatches targeted Linear execution to a selected worktree executor.
- **target-host.mjs** - Exports `TARGET_HOST`, a shared constant used by sibling modules.
- **worktree-ids.mjs** - Exports `WORKTREE_IDS`, a shared constant used by sibling modules.
- **worktrees.mjs** - Exports `WORKTREES`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/model/symphony-agent-router/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:http`, `node:path`
- **Internal relative modules** - `../../../core/worktree-config.mjs`, `../../../lib/logger.mjs`, `./global-active-requests.mjs`, `./handle-linear-queue.mjs`, `./handle-linear-trigger.mjs`, `./is-path-within-root.mjs`, `./json.mjs`, `./linear-queue.mjs`, `./logger.mjs`, `./max-concurrent.mjs`, `./max-queue-length.mjs`, `./overload.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
