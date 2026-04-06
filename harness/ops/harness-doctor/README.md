# ANQR Harness Doctor

## 1. Directory Overview

This directory implements **ANQR Harness Doctor** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 15 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-credit-gate.mjs** - Exports `checkCreditGate`, which checks credit gate.
- **check-env-vars.mjs** - Exports `checkEnvVars`, which checks env vars.
- **check-harness-config.mjs** - Exports `checkHarnessConfig`, which checks harness config.
- **check-node-modules.mjs** - Exports `checkNodeModules`, which checks node modules.
- **check-ollama.mjs** - Exports `checkOllama`, which checks ollama.
- **check-queue-state.mjs** - Exports `checkQueueState`, which checks queue state.
- **check-reports-dir.mjs** - Exports `checkReportsDir`, which checks reports dir.
- **check-systemd-services.mjs** - Exports `checkSystemdServices`, which checks systemd services.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./root.mjs`, `./check-env-vars.mjs`, `./check-node-modules.mjs`, `./check-credit-gate.mjs`, `./check-ollama.mjs`, and 6 more siblings.
- **is-main.mjs** - Exports `isMain`, which checks whether main.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point for this directory.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/harness-doctor/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../lib/logger.mjs`, `./check-credit-gate.mjs`, `./check-env-vars.mjs`, `./check-harness-config.mjs`, `./check-node-modules.mjs`, `./check-ollama.mjs`, `./check-queue-state.mjs`, `./check-reports-dir.mjs`, `./check-systemd-services.mjs`, `./dirname.mjs`, `./index.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
