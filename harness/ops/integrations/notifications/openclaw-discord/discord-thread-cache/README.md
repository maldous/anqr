# Discord Thread Cache

## Purpose

Directory for OpenClaw gateway/runtime configuration; immediate files include `get-thread-channel-id.mjs`, `index.mjs`, `set-thread-channel-id.mjs`, `thread-cache-instance.mjs`.

## Contents

- 4 immediate files
- 0 child directories

## Key Files

- `get-thread-channel-id.mjs` - Exports `getThreadChannelId`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `set-thread-channel-id.mjs` - Exports `setThreadChannelId`, the main helper defined in this file.
- `thread-cache-instance.mjs` - Exports `threadCache`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 4 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
