# Sonar Linear Audit

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `consolidated-issue-title.mjs`, `find-or-create-consolidated-issue.mjs`, `index.mjs`, `logger.mjs`, and others.

## Contents
- 10 immediate files
- 0 child directories

## Key Files
- `consolidated-issue-title.mjs` - Exports `CONSOLIDATED_ISSUE_TITLE`, a shared constant or state value used by sibling modules.
- `find-or-create-consolidated-issue.mjs` - Exports `findOrCreateConsolidatedIssue`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `project-key.mjs` - Exports `PROJECT_KEY`, a shared constant or state value used by sibling modules.
- `resolve-stale-linear-issues.mjs` - Exports `resolveStaleLinearIssues`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `sonar-host.mjs` - Exports `SONAR_HOST`, a shared constant or state value used by sibling modules.
- `sonar-token.mjs` - Exports `SONAR_TOKEN`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 10 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
