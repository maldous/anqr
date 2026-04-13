# Linear All

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `api-key.mjs`, `fetch-page.mjs`, `index.mjs`, `is-main.mjs`, and others.

## Contents
- 9 immediate files
- 0 child directories

## Key Files
- `api-key.mjs` - Exports `API_KEY`, a shared constant or state value used by sibling modules.
- `fetch-page.mjs` - Exports `fetchPage`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-main.mjs` - Exports `isMain`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `query.mjs` - Exports `query`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `team-id.mjs` - Exports `TEAM_ID`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 9 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
