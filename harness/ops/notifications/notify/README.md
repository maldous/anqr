# Notify

## Purpose

Directory for notifications and operator feedback; immediate files include `dirname.mjs`, `format-email-body.mjs`, `format-stdout.mjs`, `index.mjs`, and others.

## Contents

- 10 immediate files
- 0 child directories

## Key Files

- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `format-email-body.mjs` - Exports `formatEmailBody`, the main helper defined in this file.
- `format-stdout.mjs` - Exports `formatStdout`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `parse-args.mjs` - Exports `parseArgs`, the main helper defined in this file.
- `report-path.mjs` - Exports `REPORT_PATH`, a shared constant or state value used by sibling modules.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 10 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
