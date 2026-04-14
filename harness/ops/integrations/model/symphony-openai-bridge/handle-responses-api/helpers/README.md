# Helpers

## Purpose

Directory for OpenAI-compatible bridge execution and tool exposure; immediate files include `generate-id.mjs`, `index.mjs`, `sse-event.mjs`.

## Contents

- 3 immediate files
- 0 child directories

## Key Files

- `generate-id.mjs` - Exports `generateId`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `sse-event.mjs` - Exports `sseEvent`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
