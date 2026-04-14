# Symphony Control

## Purpose
Symphony Control contains the code, configuration, or support files that implement this part of the harness architecture.

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
- Current on-disk inventory: 9 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
