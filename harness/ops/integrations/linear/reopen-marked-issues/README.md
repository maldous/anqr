# Reopen Marked Issues

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `reopen-patterns.mjs`, and others.

## Contents

- 5 immediate files
- 0 child directories

## Key Files

- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `reopen-patterns.mjs` - Exports `REOPEN_PATTERNS`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 5 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
