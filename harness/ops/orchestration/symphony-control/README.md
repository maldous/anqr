# Symphony Control

## Purpose

Directory for runtime service bootstrap or environment support; immediate files include `disable-all-timers.mjs`, `enable-all-timers.mjs`, `get-enabled-timers.mjs`, `get-timer-status.mjs`, and others.

## Contents

- 9 immediate files
- 0 child directories

## Key Files

- `disable-all-timers.mjs` - Exports `disableAllTimers`, the main helper defined in this file.
- `enable-all-timers.mjs` - Exports `enableAllTimers`, the main helper defined in this file.
- `get-enabled-timers.mjs` - Exports `getEnabledTimers`, the main helper defined in this file.
- `get-timer-status.mjs` - Exports `getTimerStatus`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `show-status.mjs` - Exports `showStatus`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 9 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.
