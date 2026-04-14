# Context7 Http Service

## Purpose

Directory for runtime service bootstrap or environment support; immediate files include `handle-request.mjs`, `index.mjs`, `logger.mjs`, `port.mjs`, and others.

## Contents

- 10 immediate files
- 0 child directories

## Key Files

- `handle-request.mjs` - Exports `handleRequest`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `port.mjs` - Exports `PORT`, a shared constant or state value used by sibling modules.
- `read-body.mjs` - Exports `readBody`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `send-json.mjs` - Exports `sendJSON`, the main helper defined in this file.
- `server.mjs` - Exports `server`, a shared constant or state value used by sibling modules.
- `shutdown.mjs` - Exports `shutdown`, the main helper defined in this file.
- `started-at.mjs` - Exports `startedAt`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 10 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
