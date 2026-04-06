# ANQR Linear All

## 1. Directory Overview

This directory implements **ANQR Linear All** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 9 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **api-key.mjs** - Exports `API_KEY`, a shared constant used by sibling modules.
- **fetch-page.mjs** - Exports `fetchPage`, which fetches page.
- **index.mjs** - Facade module that re-exports public members from `./api-key.mjs`, `./team-id.mjs`, `./query.mjs`, `./fetch-page.mjs`, `./main.mjs`, `./is-main.mjs`.
- **is-main.mjs** - Exports `isMain`, which checks whether main.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **query.mjs** - Exports `query`, which implements query.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **team-id.mjs** - Exports `TEAM_ID`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, network/API integration, and Linear integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/linear-all/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:url`
- **Internal relative modules** - `../lib/logger.mjs`, `./api-key.mjs`, `./fetch-page.mjs`, `./index.mjs`, `./logger.mjs`, `./team-id.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
