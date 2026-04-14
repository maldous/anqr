# Notify

## Purpose

Directory for Linear ingestion, reconciliation, or issue management; immediate files include `check-dedup.mjs`, `dedup-window-ms.mjs`, `dirname.mjs`, `ensure-dir.mjs`, and others.

## Contents

- 16 immediate files
- 0 child directories

## Key Files

- `check-dedup.mjs` - Exports `checkDedup`, the main helper defined in this file.
- `dedup-window-ms.mjs` - Exports `DEDUP_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `ensure-dir.mjs` - Exports `ensureDir`, the main helper defined in this file.
- `format-issue-line.mjs` - Exports `formatIssueLine`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `linear-issue-url.mjs` - Exports `linearIssueUrl`, the main helper defined in this file.
- `linear-workspace.mjs` - Exports `LINEAR_WORKSPACE`, a shared constant or state value used by sibling modules.
- `load-state.mjs` - Exports `loadState`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `rate-limit-file.mjs` - Exports `RATE_LIMIT_FILE`, a shared constant or state value used by sibling modules.
- `recipient.mjs` - Exports `RECIPIENT`, a shared constant or state value used by sibling modules.
- `save-state.mjs` - Exports `saveState`, the main helper defined in this file.
- `send-notification.mjs` - Exports `sendNotification`, the main helper defined in this file.
- `state-dir.mjs` - Exports `STATE_DIR`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 16 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
