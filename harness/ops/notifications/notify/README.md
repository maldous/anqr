# Notify

## Purpose
Notify contains the code, configuration, or support files that implement this part of the harness architecture.

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
- Current on-disk inventory: 10 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
