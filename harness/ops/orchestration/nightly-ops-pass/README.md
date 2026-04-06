# ANQR Nightly Operations Pass

## 1. Directory Overview

This directory contains the nightly operations pass automation for the ANQR (Agentic Number Query
Runner) harness. It orchestrates a comprehensive pipeline of health checks, maintenance tasks, and
quality assurance steps that run on a scheduled basis to ensure the system remains operational and
maintainable. It currently contains 16 files and 0 subdirectories.

## 2. File Summaries

### Files

- **archive-report.mjs** - Exports `archiveReport()` function that copies `latest.json` to `reports/archive/report-{timestamp}.json`.
- **dirname.mjs** - Node.js `__dirname` polyfill for ESM compatibility using `fileURLToPath`.
- **dry-run-flag.mjs** - Exports `dryRunFlag` string (`" --dry-run"` or empty) for command concatenation.
- **dry-run.mjs** - Exports `dryRun` boolean flag based on presence of `--dry-run` in process arguments.
- **index.mjs** - Generated facade index that exports all public API members from the decomposed modules.
- **latest-report.mjs** - Exports `LATEST_REPORT` constant pointing to `reports/latest.json`.
- **logger.mjs** - Shared logger for this module, importing from `../../lib/logger.mjs` and exporting `logInfo` and `logError`.
- **main.mjs** - Main orchestration module that defines the pipeline plan with steps, executes them sequentially, handles blocking step failures, archives the report, prints summary, and exits appropriately.
- **print-summary.mjs** - Exports `printSummary()` function that logs a formatted table of all step results with exit codes, durations, and severity levels.
- **reports-dir.mjs** - Exports `REPORTS_DIR` constant resolving to the `reports/` directory in the project root.
- **root.mjs** - Exports `ROOT` constant pointing to the project root (4 directories up from this module).
- **run-step.mjs** - Exports `runStep(step)` function that executes a step command via `execFileSync`, captures exit code and duration, logs results, and pushes result to `steps` array.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes `main()` with error handling.
- **skip-sonar.mjs** - Exports `skipSonar` boolean flag based on presence of `--skip-sonar` in process arguments.
- **skip-tests.mjs** - Exports `skipTests` boolean flag based on presence of `--skip-tests` in process arguments.
- **steps.mjs** - Exports mutable `steps` array that stores results of each pipeline step execution.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/nightly-ops-pass/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
