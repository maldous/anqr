# Logger

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `log-error.mjs`, `log-warn.mjs`, `prefix.mjs`.

## Contents

- 4 immediate files
- 0 child directories

## Key Files

- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `log-error.mjs` - Exports `logError`, a shared constant or state value used by sibling modules.
- `log-warn.mjs` - Exports `logWarn`, a shared constant or state value used by sibling modules.
- `prefix.mjs` - Exports `PREFIX`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 4 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
