# Logger

## Purpose

Directory for harness support logic; immediate files include `create-logger.mjs`, `get-caller-info.mjs`, `index.mjs`, `log-levels.mjs`.

## Contents

- 4 immediate files
- 0 child directories

## Key Files

- `create-logger.mjs` - Exports `createLogger`, the main helper defined in this file.
- `get-caller-info.mjs` - Exports `getCallerInfo`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `log-levels.mjs` - Exports `LOG_LEVELS`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 4 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
