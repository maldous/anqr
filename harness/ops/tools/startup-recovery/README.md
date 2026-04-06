# ANQR Startup Recovery

## 1. Directory Overview

This directory implements **ANQR Startup Recovery** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 5 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Facade module that re-exports public members from `./run-command.mjs`, `./main.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **run-command.mjs** - Exports `runCommand`, which runs command.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, and Symphony integration.

## 4. Usage Instructions

```bash
node ops/tools/startup-recovery/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`
- **Internal relative modules** - `../../integrations/linear/linear-client.mjs`, `../../lib/logger.mjs`, `../../symphony-queue-control.mjs`, `./index.mjs`, `./logger.mjs`, `./run-command.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
