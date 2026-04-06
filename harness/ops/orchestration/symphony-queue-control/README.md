# ANQR Queue Control

## 1. Directory Overview

This directory implements **ANQR Queue Control** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 16 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **actions.mjs** - Exports `actions`, an initially empty array used by sibling modules.
- **count-enabled-timers.mjs** - Exports `countEnabledTimers`, which implements count enabled timers.
- **detect-stuck-work.mjs** - Exports `detectStuckWork`, which detects stuck work.
- **drain-overflow.mjs** - Exports `drainOverflow`, which implements drain overflow.
- **enforce-max-concurrent.mjs** - Exports `enforceMaxConcurrent`, which implements enforce max concurrent.
- **feed-queue.mjs** - Exports `feedQueue`, which implements feed queue.
- **get-queue-snapshot.mjs** - Exports `getQueueSnapshot`, which gets queue snapshot.
- **index.mjs** - Facade module that re-exports public members from `./actions.mjs`, `./log-action.mjs`, `./issue-age.mjs`, `./minutes-ago.mjs`, `./get-queue-snapshot.mjs`, `./count-enabled-timers.mjs`, and 7 more siblings.
- **issue-age.mjs** - Exports `issueAge`, which implements issue age.
- **log-action.mjs** - Exports `logAction`, which implements log action.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **minutes-ago.mjs** - Exports `minutesAgo`, which implements minutes ago.
- **print-queue-health.mjs** - Exports `printQueueHealth`, which implements print queue health.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **validate-concurrency-config.mjs** - Exports `validateConcurrencyConfig`, which validates concurrency config.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Discord integration, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-queue-control/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:url`
- **Internal relative modules** - `../../core/discord-source.mjs`, `../../lib/logger.mjs`, `../../linear-client.mjs`, `../../symphony-config.mjs`, `../../symphony-state.mjs`, `./actions.mjs`, `./count-enabled-timers.mjs`, `./detect-stuck-work.mjs`, `./drain-overflow.mjs`, `./enforce-max-concurrent.mjs`, `./feed-queue.mjs`, `./get-queue-snapshot.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
