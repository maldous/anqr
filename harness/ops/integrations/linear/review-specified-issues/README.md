# ANQR Linear Issue Review

## 1. Directory Overview

This directory implements **ANQR Linear Issue Review** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 7 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **completion-checks.mjs** - Exports `COMPLETION_CHECKS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./root.mjs`, `./issues-to-review.mjs`, `./completion-checks.mjs`, `./main.mjs`.
- **issues-to-review.mjs** - Exports `ISSUES_TO_REVIEW`, a shared constant used by sibling modules.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, OpenClaw integration, and Symphony integration.

## 4. Usage Instructions

```bash
node ops/integrations/linear/review-specified-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./completion-checks.mjs`, `./index.mjs`, `./issues-to-review.mjs`, `./logger.mjs`, `./root.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
