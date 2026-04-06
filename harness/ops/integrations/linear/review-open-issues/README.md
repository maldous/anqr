# ANQR Linear Review Open Issues

## 1. Directory Overview

This directory implements **ANQR Linear Review Open Issues** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 15 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **exec-async.mjs** - Exports `execAsync`, which implements exec async.
- **extract-check-name.mjs** - Exports `extractCheckName`, which implements extract check name.
- **extract-sonar-dup-key.mjs** - Exports `extractSonarDupKey`, which implements extract sonar dup key.
- **extract-sonar-key.mjs** - Exports `extractSonarKey`, which implements extract sonar key.
- **file-exists-in-git.mjs** - Exports `fileExistsInGit`, which implements file exists in git.
- **get-harness-status.mjs** - Exports `getHarnessStatus`, which gets harness status.
- **index.mjs** - Facade module that re-exports public members from `./exec-async.mjs`, `./dirname.mjs`, `./root.mjs`, `./open-states.mjs`, `./stale-days.mjs`, `./extract-sonar-key.mjs`, and 6 more siblings.
- **is-stale.mjs** - Exports `isStale`, which checks whether stale.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **open-states.mjs** - Exports `OPEN_STATES`, a shared constant used by sibling modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **stale-days.mjs** - Exports `STALE_DAYS`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, subprocess execution, Linear integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/linear/review-open-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`, `node:url`, `node:util`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../linear-client.mjs`, `./dirname.mjs`, `./exec-async.mjs`, `./extract-check-name.mjs`, `./extract-sonar-dup-key.mjs`, `./extract-sonar-key.mjs`, `./file-exists-in-git.mjs`, `./get-harness-status.mjs`, `./index.mjs`, `./is-stale.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
