# Linear Status

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `logger.mjs`, `main.mjs`, `runtime.mjs`, with child directories `logger/`, `main/`.

## Contents

- 4 immediate files
- 2 child directories

## Key Files

- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Re-export facade that assembles the public surface for this directory.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- `logger/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `log-error.mjs`, `log-warn.mjs`, `prefix.mjs`.
- `main/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `has-active-cooldown.mjs`, `index.mjs`, `main.mjs`, `pad.mjs`.

## Operational Notes

- Current on-disk inventory: 4 immediate files and 2 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
