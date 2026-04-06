# ANQR Linear Issue Review

## 1. Directory Overview

This directory contains automation for reviewing and updating specific Linear issues based on pre-
defined completion checks. It provides a programmatic way to assess issue status, verify evidence
files, and update issue states in Linear based on completion criteria. It currently contains 7 files
and 0 subdirectories.

## 2. File Summaries

### Files

- **completion-checks.mjs** - Exports `COMPLETION_CHECKS` object mapping each issue identifier to its assessment data including evidence file path, status (DOCUMENTED_NOT_FIXED, NO_EVIDENCE, COMPLETE, INFRASTRUCTURE_COMPLETE_VALIDATION_PENDING, VALIDATION_PENDING, IMPLEMENTED_AS_PART_OF_1129), reason, action (MARK_DONE, REOPEN_TO_BACKLOG, CHECK_IMPLEMENTATION), and optional comment text.
- **index.mjs** - Generated facade index that exports all public API members: `ROOT`, `ISSUES_TO_REVIEW`, `COMPLETION_CHECKS`, and `main` function from sibling modules.
- **issues-to-review.mjs** - Exports `ISSUES_TO_REVIEW` array containing the list of Linear issue identifiers to review (ANQ-1137, ANQ-1136, ANQ-1135, ANQ-1134, ANQ-1133, ANQ-1132, ANQ-1129, ANQ-1128, ANQ-1127, ANQ-1126).
- **logger.mjs** - Shared logger module using the project's standard logger from `../../../lib/logger.mjs`. Exports `logInfo` and `logError` functions.
- **main.mjs** - Core orchestration module that fetches all issues across states, iterates through the predefined issue list, validates evidence files, determines appropriate actions, and updates issue states in Linear with comments.
- **root.mjs** - Path resolution utility exporting `ROOT` constant as `resolve(process.cwd())` for resolving relative paths from project root.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/review-specified-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
