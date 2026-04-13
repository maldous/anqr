# Mcp

## Purpose
Directory for runtime service bootstrap or environment support; immediate files include `context7-http-service.mjs`, `context7-server.mjs`, with child directories `context7-http-service/`, `context7-server/`.

## Contents
- 2 immediate files
- 2 child directories

## Key Files
- `context7-http-service.mjs` - JavaScript/TypeScript module used by this directory.
- `context7-server.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `context7-http-service/` - Directory for runtime service bootstrap or environment support; immediate files include `handle-request.mjs`, `index.mjs`, `logger.mjs`, `port.mjs`, and others.
- `context7-server/` - Directory for runtime service bootstrap or environment support; immediate files include `add-part.mjs`, `build-docs-arguments.mjs`, `build-resolve-arguments.mjs`, `call-local-tool.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 2 immediate files and 2 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
