# Mcp

## Purpose
Mcp contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 2 immediate files
- 2 child directories

## Key Files

- `context7-http-service.mjs` - JavaScript/TypeScript module used by this directory.
- `context7-server.mjs` - JavaScript/TypeScript module used by this directory.

## Subdirectories
- `context7-http-service/` - Context7 Http Service scope; immediate files include `handle-request.mjs`, `index.mjs`, `logger.mjs`, `port.mjs`, and others.
- `context7-server/` - Context7 Server scope; immediate files include `add-part.mjs`, `build-docs-arguments.mjs`, `build-resolve-arguments.mjs`, `call-local-tool.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 2 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
