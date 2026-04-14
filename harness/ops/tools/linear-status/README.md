# Linear Status

## Purpose
Linear Status contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents
- 4 immediate files
- 2 child directories

## Key Files
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Re-export facade that assembles the public surface for this directory.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories
- `logger/` - Logger scope; immediate files include `index.mjs`, `log-error.mjs`, `log-warn.mjs`, `prefix.mjs`.
- `main/` - Main scope; immediate files include `has-active-cooldown.mjs`, `index.mjs`, `main.mjs`, `pad.mjs`.

## Operational Notes
- Current on-disk inventory: 4 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
