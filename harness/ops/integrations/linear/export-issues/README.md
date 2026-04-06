# ANQR Linear Export Issues

## 1. Directory Overview

This directory implements **ANQR Linear Export Issues** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 9 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **done-days-lookback.mjs** - Exports `DONE_DAYS_LOOKBACK`, a shared constant used by sibling modules.
- **fetch-recent-done-issues.mjs** - Exports `fetchRecentDoneIssues`, which fetches recent done issues.
- **index.mjs** - Facade module that re-exports public members from `./open-states.mjs`, `./done-days-lookback.mjs`, `./output-dir.mjs`, `./output-file.mjs`, `./fetch-recent-done-issues.mjs`, `./main.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **open-states.mjs** - Exports `OPEN_STATES`, a shared constant used by sibling modules.
- **output-dir.mjs** - Exports `OUTPUT_DIR`, a shared constant used by sibling modules.
- **output-file.mjs** - Exports `OUTPUT_FILE`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, and Linear integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/linear/export-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./done-days-lookback.mjs`, `./fetch-recent-done-issues.mjs`, `./index.mjs`, `./logger.mjs`, `./open-states.mjs`, `./output-dir.mjs`, `./output-file.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
