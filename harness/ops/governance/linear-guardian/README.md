# ANQR Linear Guardian

## 1. Directory Overview

This directory implements **ANQR Linear Guardian** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 19 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **actions.mjs** - Exports `actions`, an initially empty array used by sibling modules.
- **build-comment-body.mjs** - Exports `buildCommentBody`, which builds comment body.
- **build-issue-body.mjs** - Exports `buildIssueBody`, which builds issue body.
- **build-issue-title.mjs** - Exports `buildIssueTitle`, which builds issue title.
- **check-metadata.mjs** - Exports `CHECK_METADATA`, a shared constant used by sibling modules.
- **check-stale-issues.mjs** - Exports `checkStaleIssues`, which checks stale issues.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./root.mjs`, `./report-path.mjs`, `./check-metadata.mjs`, `./build-issue-title.mjs`, `./build-issue-body.mjs`, and 10 more siblings.
- **is-stale.mjs** - Exports `isStale`, which checks whether stale.
- **issue-needs-label-hygiene.mjs** - Exports `issueNeedsLabelHygiene`, which implements issue needs label hygiene.
- **log-action.mjs** - Exports `logAction`, which implements log action.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **merged-label-ids.mjs** - Exports `mergedLabelIds`, which implements merged label ids.
- **print-summary.mjs** - Exports `printSummary`, which implements print summary.
- **process-failing-check.mjs** - Exports `processFailingCheck`, which implements process failing check.
- **report-path.mjs** - Exports `REPORT_PATH`, a shared constant used by sibling modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, Linear integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/governance/linear-guardian/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../core/symphony-state.mjs`, `../../lib/logger.mjs`, `../../linear-client.mjs`, `../../symphony-config.mjs`, `./actions.mjs`, `./build-comment-body.mjs`, `./build-issue-body.mjs`, `./build-issue-title.mjs`, `./check-metadata.mjs`, `./check-stale-issues.mjs`, `./dirname.mjs`, `./index.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
