# ANQR Linear Analyze Canceled Issues

## 1. Directory Overview

This directory contains automation for analyzing canceled Linear issues to identify which ones may
have been incorrectly canceled and should potentially be reopened. It provides pattern-based
classification to distinguish between legitimately canceled issues and those requiring manual review
or re-evaluation. It currently contains 6 files and 0 subdirectories.

## 2. File Summaries

### Files

- **correct-cancel-patterns.mjs** - Defines CORRECT_CANCEL_PATTERNS object containing regex patterns for correctly canceled issues: NOT_IN_SCOPE (not in 1.0 claim), SUPERSEDED (superseded by other work), HUMAN_ONLY (human-only task), and EXPLICIT_CANCEL (explicit cancel marker).
- **index.mjs** - Generated facade index that exports the public API: `REOPEN_PATTERNS` from reopen-patterns.mjs, `CORRECT_CANCEL_PATTERNS` from correct-cancel-patterns.mjs, and `main` from main.mjs.
- **logger.mjs** - Shared logger module that imports createLogger from the lib logger and exports logInfo and logWarn functions for consistent logging throughout the module.
- **main.mjs** - Main orchestration logic. Fetches all issues in "Canceled" state from Linear using listIssuesByState, then categorizes each issue into three buckets: `shouldReopen` (issues with reopening markers), `correctlyCanceled` (issues with valid cancellation reasons), and `needsReview` (issues requiring manual assessment). Outputs detailed analysis including issue identifiers, titles, reasons, labels, creation dates, and descriptions. Returns structured analysis data.
- **reopen-patterns.mjs** - Defines REOPEN_PATTERNS object containing regex patterns for identifying issues that should be reopened: REOPENED (explicit reopen marker), PARENT_ISSUE (parent issue that should remain open for tracking), RE_EVALUATE (re-evaluation marker), and ACTIVE_WORK (deferred work that is documented).
- **runtime.mjs** - Generated runtime carry-forward that imports main from index.mjs and executes it, providing a CLI entry point for the module.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/linear/analyze-canceled-issues/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
