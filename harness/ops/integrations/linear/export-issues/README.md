# Export Issues

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `done-days-lookback.mjs`, `fetch-recent-done-issues.mjs`, `index.mjs`, `logger.mjs`, and others.

## Contents

- 9 immediate files
- 0 child directories

## Key Files

- `done-days-lookback.mjs` - Exports `DONE_DAYS_LOOKBACK`, a shared constant or state value used by sibling modules.
- `fetch-recent-done-issues.mjs` - Exports `fetchRecentDoneIssues`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `open-states.mjs` - Exports `OPEN_STATES`, a shared constant or state value used by sibling modules.
- `output-dir.mjs` - Exports `OUTPUT_DIR`, a shared constant or state value used by sibling modules.
- `output-file.mjs` - Exports `OUTPUT_FILE`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 9 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
