# Recover Stale In Progress

## Purpose

Directory for runtime service bootstrap or environment support; immediate files include `index.mjs`, `issue-age.mjs`, `logger.mjs`, `main.mjs`, and others.

## Contents

- 6 immediate files
- 0 child directories

## Key Files

- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `issue-age.mjs` - Exports `issueAge`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `minutes-ago.mjs` - Exports `minutesAgo`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 6 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
