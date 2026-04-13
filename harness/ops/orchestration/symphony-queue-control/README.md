# Symphony Queue Control

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `actions.mjs`, `count-enabled-timers.mjs`, `detect-stuck-work.mjs`, `drain-overflow.mjs`, and others.

## Contents
- 16 immediate files
- 0 child directories

## Key Files
- `actions.mjs` - Exports `actions`, a shared constant or state value used by sibling modules.
- `count-enabled-timers.mjs` - Exports `countEnabledTimers`, the main helper defined in this file.
- `detect-stuck-work.mjs` - Exports `detectStuckWork`, the main helper defined in this file.
- `drain-overflow.mjs` - Exports `drainOverflow`, the main helper defined in this file.
- `enforce-max-concurrent.mjs` - Exports `enforceMaxConcurrent`, the main helper defined in this file.
- `feed-queue.mjs` - Exports `feedQueue`, the main helper defined in this file.
- `get-queue-snapshot.mjs` - Exports `getQueueSnapshot`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `issue-age.mjs` - Exports `issueAge`, the main helper defined in this file.
- `log-action.mjs` - Exports `logAction`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `minutes-ago.mjs` - Exports `minutesAgo`, the main helper defined in this file.
- `print-queue-health.mjs` - Exports `printQueueHealth`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `validate-concurrency-config.mjs` - Exports `validateConcurrencyConfig`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 16 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.
