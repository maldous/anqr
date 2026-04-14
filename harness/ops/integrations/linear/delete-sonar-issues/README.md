# Delete Sonar Issues

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `delete-issue.mjs`, `index.mjs`, `logger.mjs`, `main.mjs`, and others.

## Contents

- 5 immediate files
- 0 child directories

## Key Files

- `delete-issue.mjs` - Exports `deleteIssue`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 5 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
