# ANQR Webhook System Verification

## 1. Directory Overview

This directory implements **ANQR Webhook System Verification** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 7 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-systemd-service.mjs** - Exports `checkSystemdService`, which checks systemd service.
- **check-systemd-timer.mjs** - Exports `checkSystemdTimer`, which checks systemd timer.
- **get-systemd-status.mjs** - Exports `getSystemdStatus`, which gets systemd status.
- **index.mjs** - Facade module that re-exports public members from `./check-systemd-service.mjs`, `./check-systemd-timer.mjs`, `./get-systemd-status.mjs`, `./main.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, and Symphony integration.

## 4. Usage Instructions

```bash
node ops/tools/verify-webhook-system/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`
- **Internal relative modules** - `../../core/symphony-state.mjs`, `../../integrations/linear/linear-client.mjs`, `../../lib/logger.mjs`, `../../orchestration/symphony-queue-control.mjs`, `./check-systemd-service.mjs`, `./check-systemd-timer.mjs`, `./get-systemd-status.mjs`, `./index.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
