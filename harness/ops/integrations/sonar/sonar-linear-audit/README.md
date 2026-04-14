# Sonar Linear Audit

## Purpose
Sonar Linear Audit contains the code, configuration, or support files that implement this part of the harness architecture.

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
- Current on-disk inventory: 10 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
