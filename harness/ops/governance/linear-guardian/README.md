# ANQR Linear Guardian

## 1. Directory Overview

This directory contains the Linear Guardian governance automation module for the ANQR (Agentic
Number Query Runner) harness. The Linear Guardian monitors harness health checks, detects failures,
and automatically creates or updates Linear issues to track and escalate code quality problems. It
serves as an automated governance layer that ensures the codebase maintains quality standards by
surfacing issues directly in the team's project management workflow. It currently contains 19 files
and 0 subdirectories.

## 2. File Summaries

### Files

- **actions.mjs** - Mutable array that stores all actions performed during a run. Exported for use by other modules.
- **build-comment-body.mjs** - Constructs comment body for existing issues, noting the check is still failing with updated timestamp and profile info.
- **build-issue-body.mjs** - Constructs the Markdown body for newly created Linear issues. Includes check name, profile, timestamp, duration, and a code block with detailed failure information.
- **build-issue-title.mjs** - Builds the issue title using `TITLE_PREFIX` from symphony-config, formatted as `${TITLE_PREFIX}: ${checkName} failure`.
- **check-metadata.mjs** - Metadata configuration for each check type. Defines `CHECK_METADATA` object containing summary descriptions, priority levels (1-4), and extra labels for each check: `repo-structure`, `typecheck`, `lint`, `test-unit`, `depcruise`, `docs-freshness`, `ollama-health`, and `litellm-routing`.
- **check-stale-issues.mjs** - Detects and escalates stale "In Progress" issues. Uses `isStale` to filter issues that haven't been updated within `STALE_THRESHOLD_MS`. Adds escalation comments to stale issues and returns the count of stale issues found. Supports dry-run mode.
- **dirname.mjs** - Node.js `__dirname` polyfill using `fileURLToPath` for ESM compatibility.
- **index.mjs** - Generated facade index that re-exports all public API members from the directory's modules. Exports functions including `main`, `processFailingCheck`, `checkStaleIssues`, `printSummary`, and utilities like `buildIssueTitle`, `buildIssueBody`, `buildCommentBody`, `isStale`, `issueNeedsLabelHygiene`, `mergedLabelIds`, plus constants `ROOT`, `REPORT_PATH`, `CHECK_METADATA`, and `actions`.
- **is-stale.mjs** - Stale detection utility. Compares issue `updatedAt` against `STALE_THRESHOLD_MS` from symphony-config to determine if an issue has gone inactive.
- **issue-needs-label-hygiene.mjs** - Checks if a Linear issue has all `REQUIRED_LABEL_IDS` from symphony-config. Returns true if any required label is missing.
- **log-action.mjs** - Logging utility that records actions to the `actions` array and logs with appropriate icons and log levels based on action type (`create`, `comment`, `hygiene`, `skip`, `stale`, `info`).
- **logger.mjs** - Shared logger module that creates a logger via `../../lib/logger.mjs` and exports `logInfo`, `logError`, `logDebug`, and `logWarn`.
- **main.mjs** - Main orchestration module. Reads the harness report from `REPORT_PATH`, identifies failing checks, processes each failure via `processFailingCheck`, checks for stale in-progress issues, and prints a summary. Supports `--dry-run` flag for testing without making Linear API calls. Exits with appropriate codes based on results.
- **merged-label-ids.mjs** - Merges existing issue labels with required labels, returning a deduplicated array of label IDs.
- **print-summary.mjs** - Prints a summary of actions taken, counting each action type and logging the counts.
- **process-failing-check.mjs** - Core logic for handling failing checks. Checks if an issue already exists for the failing check (by exact title match), and if so adds a comment with updated failure details. Otherwise creates a new Linear issue with the check details. Includes label hygiene enforcement, queue depth checking against `TARGET_MAX`, and dry-run support.
- **report-path.mjs** - Path constant for the harness report, pointing to `reports/latest.json` relative to the project root.
- **root.mjs** - Path resolution utility that resolves the project root directory by traversing up from the module's location.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function. Provides CLI entry point via `await main()`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/governance/linear-guardian/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
