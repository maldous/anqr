# Execute Repair

## Purpose
Directory for fleet recovery, quarantine, and health enforcement; immediate files include `build-commit-message.mjs`, `execute-repair.mjs`, `extract-file-names.mjs`, `format-file-summary.mjs`, and others.

## Contents
- 5 immediate files
- 0 child directories

## Key Files
- `build-commit-message.mjs` - Exports `buildCommitMessage`, the main helper defined in this file.
- `execute-repair.mjs` - Exports `executeRepair`, the main helper defined in this file.
- `extract-file-names.mjs` - Exports `extractFileNames`, the main helper defined in this file.
- `format-file-summary.mjs` - Exports `formatFileSummary`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 5 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.
