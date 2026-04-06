# ANQR Linear Export Issues

## 1. Directory Overview

This directory contains the Linear issue export functionality for the ANQR (Agentic Number Query
Runner) harness. It provides the capability to export Linear issues (both open and recently
completed) to JSON files for reporting, backup, or further processing purposes. It currently
contains 9 files and 0 subdirectories.

## 2. File Summaries

### Files

- **done-days-lookback.mjs** - Exports `DONE_DAYS_LOOKBACK = 90`, defining how many days back to look for recently completed issues.
- **fetch-recent-done-issues.mjs** - Function to fetch issues in "Done" state updated within the specified number of days. Uses pagination to fetch all results and returns an array of issue nodes with id, identifier, title, description, priority, state, labels, createdAt, and updatedAt.
- **index.mjs** - Auto-generated facade index that exports all public API members: `OPEN_STATES`, `DONE_DAYS_LOOKBACK`, `OUTPUT_DIR`, `OUTPUT_FILE`, `fetchRecentDoneIssues`, and `main`.
- **logger.mjs** - Shared logger for this module using the centralized logger from `../../../lib/logger.mjs`. Exports `logInfo` and `logError`.
- **main.mjs** - Main export orchestration. Fetches open issues, fetches recent Done issues (last 90 days), combines them (filtering out Canceled), and writes to JSON. Also prints state distribution summary.
- **open-states.mjs** - Exports `OPEN_STATES` array containing the states considered "open": Backlog, Todo, In Progress, In Review, Blocked, and Human Review.
- **output-dir.mjs** - Exports `OUTPUT_DIR = "reports/linear-export"`, the directory where exports are written.
- **output-file.mjs** - Exports `OUTPUT_FILE = "reports/linear-export/issues-latest.json"`, the full path to the output JSON file.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function. This is the CLI entry point for running the export.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/export-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
