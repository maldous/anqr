# Correlation Id

## Purpose
Directory for harness support logic; immediate files include `correlation-id-from-request.mjs`, `extract-correlation-id.mjs`, `generate-correlation-id.mjs`, `index.mjs`.

## Contents
- 4 immediate files
- 0 child directories

## Key Files
- `correlation-id-from-request.mjs` - Exports `correlationIdFromRequest`, the main helper defined in this file.
- `extract-correlation-id.mjs` - Exports `extractCorrelationId`, the main helper defined in this file.
- `generate-correlation-id.mjs` - Exports `generateCorrelationId`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 4 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
