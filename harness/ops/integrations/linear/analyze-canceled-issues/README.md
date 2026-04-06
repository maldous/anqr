# ANQR Linear Analyze Canceled Issues

## 1. Directory Overview

This directory implements **ANQR Linear Analyze Canceled Issues** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 6 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **correct-cancel-patterns.mjs** - Exports `CORRECT_CANCEL_PATTERNS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./reopen-patterns.mjs`, `./correct-cancel-patterns.mjs`, `./main.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **reopen-patterns.mjs** - Exports `REOPEN_PATTERNS`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory use Linear integration.

## 4. Usage Instructions

```bash
node ops/integrations/linear/analyze-canceled-issues/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./correct-cancel-patterns.mjs`, `./index.mjs`, `./logger.mjs`, `./reopen-patterns.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
