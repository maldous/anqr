# Nightly Ops Pass

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `archive-report.mjs`, `dirname.mjs`, `dry-run-flag.mjs`, `dry-run.mjs`, and others.

## Contents
- 16 immediate files
- 0 child directories

## Key Files
- `archive-report.mjs` - Exports `archiveReport`, the main helper defined in this file.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `dry-run-flag.mjs` - Exports `dryRunFlag`, a shared constant or state value used by sibling modules.
- `dry-run.mjs` - Exports `dryRun`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `latest-report.mjs` - Exports `LATEST_REPORT`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `print-summary.mjs` - Exports `printSummary`, the main helper defined in this file.
- `reports-dir.mjs` - Exports `REPORTS_DIR`, a shared constant or state value used by sibling modules.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `run-step.mjs` - Exports `runStep`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `skip-sonar.mjs` - Exports `skipSonar`, a shared constant or state value used by sibling modules.
- `skip-tests.mjs` - Exports `skipTests`, a shared constant or state value used by sibling modules.
- `steps.mjs` - Exports `steps`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 16 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.
