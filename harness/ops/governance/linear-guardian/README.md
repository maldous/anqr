# ANQR Linear Guardian

## 1. Directory Overview

This directory contains the Linear Guardian governance automation module for the ANQR (Agentic Number Query Runner) harness. The Linear Guardian monitors harness health checks, detects failures, and automatically creates or updates Linear issues to track and escalate code quality problems. It serves as an automated governance layer that ensures the codebase maintains quality standards by surfacing issues directly in the team's project management workflow.

## 2. File Summaries

### Facade Modules

- **index.mjs** - Generated facade index that re-exports all public API members from the directory's modules. Exports functions including `main`, `processFailingCheck`, `checkStaleIssues`, `printSummary`, and utilities like `buildIssueTitle`, `buildIssueBody`, `buildCommentBody`, `isStale`, `issueNeedsLabelHygiene`, `mergedLabelIds`, plus constants `ROOT`, `REPORT_PATH`, `CHECK_METADATA`, and `actions`.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function. Provides CLI entry point via `await main()`.

### Core Implementation Files

- **main.mjs** - Main orchestration module. Reads the harness report from `REPORT_PATH`, identifies failing checks, processes each failure via `processFailingCheck`, checks for stale in-progress issues, and prints a summary. Supports `--dry-run` flag for testing without making Linear API calls. Exits with appropriate codes based on results.

- **process-failing-check.mjs** - Core logic for handling failing checks. Checks if an issue already exists for the failing check (by exact title match), and if so adds a comment with updated failure details. Otherwise creates a new Linear issue with the check details. Includes label hygiene enforcement, queue depth checking against `TARGET_MAX`, and dry-run support.

- **check-stale-issues.mjs** - Detects and escalates stale "In Progress" issues. Uses `isStale` to filter issues that haven't been updated within `STALE_THRESHOLD_MS`. Adds escalation comments to stale issues and returns the count of stale issues found. Supports dry-run mode.

- **check-metadata.mjs** - Metadata configuration for each check type. Defines `CHECK_METADATA` object containing summary descriptions, priority levels (1-4), and extra labels for each check: `repo-structure`, `typecheck`, `lint`, `test-unit`, `depcruise`, `docs-freshness`, `ollama-health`, and `litellm-routing`.

- **build-issue-body.mjs** - Constructs the Markdown body for newly created Linear issues. Includes check name, profile, timestamp, duration, and a code block with detailed failure information.

- **build-issue-title.mjs** - Builds the issue title using `TITLE_PREFIX` from symphony-config, formatted as `${TITLE_PREFIX}: ${checkName} failure`.

- **build-comment-body.mjs** - Constructs comment body for existing issues, noting the check is still failing with updated timestamp and profile info.

- **is-stale.mjs** - Stale detection utility. Compares issue `updatedAt` against `STALE_THRESHOLD_MS` from symphony-config to determine if an issue has gone inactive.

- **issue-needs-label-hygiene.mjs** - Checks if a Linear issue has all `REQUIRED_LABEL_IDS` from symphony-config. Returns true if any required label is missing.

- **merged-label-ids.mjs** - Merges existing issue labels with required labels, returning a deduplicated array of label IDs.

- **log-action.mjs** - Logging utility that records actions to the `actions` array and logs with appropriate icons and log levels based on action type (`create`, `comment`, `hygiene`, `skip`, `stale`, `info`).

- **print-summary.mjs** - Prints a summary of actions taken, counting each action type and logging the counts.

- **actions.mjs** - Mutable array that stores all actions performed during a run. Exported for use by other modules.

- **logger.mjs** - Shared logger module that creates a logger via `../../lib/logger.mjs` and exports `logInfo`, `logError`, `logDebug`, and `logWarn`.

- **root.mjs** - Path resolution utility that resolves the project root directory by traversing up from the module's location.

- **report-path.mjs** - Path constant for the harness report, pointing to `reports/latest.json` relative to the project root.

- **dirname.mjs** - Node.js `__dirname` polyfill using `fileURLToPath` for ESM compatibility.

## 3. Overall Directory Function

The Linear Guardian operates as an automated governance layer that bridges the ANQR harness health checks with Linear issue management. When harness health checks fail (e.g., typecheck, lint, tests), this module automatically creates or updates Linear issues to track the failures.

The workflow proceeds as follows: `main.mjs` reads the harness report from `reports/latest.json`, identifies failing checks, and iterates through each failure. For each failing check, `processFailingCheck` determines whether a Linear issue already exists (by exact title match). If an issue exists, it adds a comment with updated failure details; if not, it creates a new issue with the check details, priority, and appropriate labels. The module respects queue depth limits (`TARGET_MAX`) to avoid overwhelming the system.

Additionally, the module monitors for stale "In Progress" issues via `check-stale-issues.mjs`, adding escalation comments to issues that haven't been updated within the stale threshold. All actions are logged with appropriate icons and detail, with a final summary printed at the end.

This automation ensures that code quality issues are immediately surfaced in the team's workflow without manual intervention, while the `--dry-run` flag allows testing the logic without making actual API calls.

## 4. Usage Instructions

### Running Linear Guardian

```bash
node ops/governance/linear-guardian/runtime.mjs
```

Or directly:

```bash
node ops/governance/linear-guardian/main.mjs
```

### Dry Run Mode

To test without making actual Linear API calls:

```bash
node ops/governance/linear-guardian/main.mjs --dry-run
```

### Prerequisites

- A valid harness report must exist at `reports/latest.json` (generated by `harness-report.mjs`)
- Linear API credentials must be configured
- Required labels must be defined in `symphony-config.mjs`

### Output

The module logs actions with icons:

- `create` (New issue created)
- `comment` (Added comment to existing issue)
- `hygiene` (Labels enforced)
- `skip` (Queue full, skipped)
- `stale` (Stale issue escalated)
- `info` (Informational message)

A summary is printed at the end showing counts by action type.

## 5. Dependencies

### Internal Dependencies

- **../../symphony-config.mjs** - Provides `TARGET_MAX`, `REQUIRED_LABEL_IDS`, `TITLE_PREFIX`, and `STALE_THRESHOLD_MS`
- **../../linear-client.mjs** - Linear API client for creating issues, updating issues, adding comments, and querying issues (`createIssue`, `updateIssue`, `addComment`, `findOpenIssuesByTitle`, `listIssuesByState`, `getQueueDepth`, `STATES`, `LABELS`)
- **../../core/symphony-state.mjs** - For patching issue state (`patchIssueState`)
- **../../lib/logger.mjs** - Logger factory for module logging

### External Services

- **Linear** - Issue tracking and management platform

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials configured in environment

## 6. Additional Comments

- **Fail-Safe Design**: The module checks queue depth before creating new issues to avoid overwhelming the system. If `currentDepth >= TARGET_MAX`, new issue creation is skipped.

- **Dry-Run Support**: All Linear API modifications can be tested via `--dry-run` flag, which logs intended actions without executing them.

- **Label Hygiene**: The module automatically enforces required labels on existing issues that may be missing them, ensuring consistent labeling across governance issues.

- **Stale Detection**: Issues in "In Progress" state that haven't been updated within `STALE_THRESHOLD_MS` receive escalation comments, helping surface stuck or abandoned work.

- **Source Tracking**: Issues created by Linear Guardian are marked with `source: "linear"` in the Symphony state, allowing worktree routing to direct them to appropriate execution contexts (wt1-wt4, main).

- **Priority Mapping**: Check failures are assigned priorities based on `CHECK_METADATA`: P1 for test-unit (critical), P2 for repo-structure/typecheck/depcruise/ollama-health/litellm-routing (high), P3 for lint (medium), P4 for docs-freshness (low).
