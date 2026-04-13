# Linear Guardian

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `actions.mjs`, `build-comment-body.mjs`, `build-issue-body.mjs`, `build-issue-title.mjs`, and others.

## Contents
- 19 immediate files
- 0 child directories

## Key Files
- `actions.mjs` - Exports `actions`, a shared constant or state value used by sibling modules.
- `build-comment-body.mjs` - Exports `buildCommentBody`, the main helper defined in this file.
- `build-issue-body.mjs` - Exports `buildIssueBody`, the main helper defined in this file.
- `build-issue-title.mjs` - Exports `buildIssueTitle`, the main helper defined in this file.
- `check-metadata.mjs` - Exports `CHECK_METADATA`, a shared constant or state value used by sibling modules.
- `check-stale-issues.mjs` - Exports `checkStaleIssues`, the main helper defined in this file.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-stale.mjs` - Exports `isStale`, the main helper defined in this file.
- `issue-needs-label-hygiene.mjs` - Exports `issueNeedsLabelHygiene`, the main helper defined in this file.
- `log-action.mjs` - Exports `logAction`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `merged-label-ids.mjs` - Exports `mergedLabelIds`, the main helper defined in this file.
- `print-summary.mjs` - Exports `printSummary`, the main helper defined in this file.
- `process-failing-check.mjs` - Exports `processFailingCheck`, the main helper defined in this file.
- `report-path.mjs` - Exports `REPORT_PATH`, a shared constant or state value used by sibling modules.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 19 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
