# ANQR Symphony Control

## 1. Directory Overview

This directory implements **ANQR Symphony Control** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 9 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **disable-all-timers.mjs** - Exports `disableAllTimers`, which implements disable all timers.
- **enable-all-timers.mjs** - Exports `enableAllTimers`, which implements enable all timers.
- **get-enabled-timers.mjs** - Exports `getEnabledTimers`, which gets enabled timers.
- **get-timer-status.mjs** - Exports `getTimerStatus`, which gets timer status.
- **index.mjs** - Facade module that re-exports public members from `./get-timer-status.mjs`, `./get-enabled-timers.mjs`, `./disable-all-timers.mjs`, `./enable-all-timers.mjs`, `./show-status.mjs`, `./main.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **show-status.mjs** - Exports `showStatus`, which shows status.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, Symphony integration, and git/worktree awareness.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-control/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`
- **Internal relative modules** - `../../lib/logger.mjs`, `./disable-all-timers.mjs`, `./enable-all-timers.mjs`, `./get-enabled-timers.mjs`, `./get-timer-status.mjs`, `./index.mjs`, `./logger.mjs`, `./show-status.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
