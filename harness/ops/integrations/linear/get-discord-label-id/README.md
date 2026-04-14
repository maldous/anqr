# Get Discord Label Id

## Purpose

Directory for Discord ingress, delivery, or notification support; immediate files include `create-discord-label.mjs`, `get-all-labels.mjs`, `index.mjs`, `logger.mjs`, and others.

## Contents

- 6 immediate files
- 0 child directories

## Key Files

- `create-discord-label.mjs` - Exports `createDiscordLabel`, the main helper defined in this file.
- `get-all-labels.mjs` - Exports `getAllLabels`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 6 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
