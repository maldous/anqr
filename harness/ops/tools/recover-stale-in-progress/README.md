# Recover Stale In Progress

## 1. Directory Overview

This directory implements **Recover Stale In Progress** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 6 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Facade module that re-exports public members from `./issue-age.mjs`, `./minutes-ago.mjs`, `./main.mjs`.
- **issue-age.mjs** - Exports `issueAge`, which implements issue age.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **minutes-ago.mjs** - Exports `minutesAgo`, which implements minutes ago.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/tools/recover-stale-in-progress/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../integrations/linear/linear-client.mjs`, `../../lib/logger.mjs`, `../../symphony-queue-control.mjs`, `./index.mjs`, `./issue-age.mjs`, `./logger.mjs`, `./minutes-ago.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
