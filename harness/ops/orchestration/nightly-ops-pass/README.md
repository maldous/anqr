# ANQR Nightly Operations Pass

## 1. Directory Overview

This directory implements **ANQR Nightly Operations Pass** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 16 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **archive-report.mjs** - Exports `archiveReport`, which implements archive report.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **dry-run-flag.mjs** - Exports `dryRunFlag`, which implements dry run flag.
- **dry-run.mjs** - Exports `dryRun`, which implements dry run.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./root.mjs`, `./reports-dir.mjs`, `./latest-report.mjs`, `./dry-run.mjs`, `./dry-run-flag.mjs`, and 7 more siblings.
- **latest-report.mjs** - Exports `LATEST_REPORT`, a shared constant used by sibling modules.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **print-summary.mjs** - Exports `printSummary`, which implements print summary.
- **reports-dir.mjs** - Exports `REPORTS_DIR`, a shared constant used by sibling modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **run-step.mjs** - Exports `runStep`, which runs step.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **skip-sonar.mjs** - Exports `skipSonar`, which implements skip sonar.
- **skip-tests.mjs** - Exports `skipTests`, which implements skip tests.
- **steps.mjs** - Exports `steps`, an initially empty array used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, subprocess execution, Symphony integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/orchestration/nightly-ops-pass/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../lib/logger.mjs`, `./archive-report.mjs`, `./dirname.mjs`, `./dry-run-flag.mjs`, `./dry-run.mjs`, `./index.mjs`, `./latest-report.mjs`, `./logger.mjs`, `./print-summary.mjs`, `./reports-dir.mjs`, `./root.mjs`, `./run-step.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
