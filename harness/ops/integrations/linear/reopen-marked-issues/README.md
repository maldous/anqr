# ANQR Linear Reopen Marked Issues

## 1. Directory Overview

This directory contains automation for reopening canceled Linear issues that have been marked for
reevaluation. It scans canceled issues for specific markers ("REOPENED:" or "RE-EVALUATE:") and
reopens them to Backlog state with a legacy issue notice comment. This helps ensure legacy issues
are properly revalidated against current architecture and 1.0 Foundation principles before
proceeding with implementation. It currently contains 5 files and 0 subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Generated facade index that exports `REOPEN_PATTERNS` from `./reopen-patterns.mjs` and `main` from `./main.mjs`. Provides the public API for this module.
- **logger.mjs** - Shared logger for this module's extracted members. Imports `createLogger` from `../../../lib/logger.mjs` and exports `logInfo`, `logWarn`, and `logError` functions.
- **main.mjs** - Core logic that fetches all "Canceled" issues from Linear, scans their title and description for REOPENED or RE-EVALUATE markers, and reopens matching issues to Backlog state. Includes dry-run support, priority classification (high for REOPENED, medium for RE-EVALUATE), rate limiting between updates, and comprehensive logging.
- **reopen-patterns.mjs** - Exports `REOPEN_PATTERNS` object containing two regex patterns: `REOPENED: /REOPENED:/i` and `RE_EVALUATE: /RE-EVALUATE:/i` for detecting marker strings in issue content.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`. This is the CLI entry point.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/reopen-marked-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
