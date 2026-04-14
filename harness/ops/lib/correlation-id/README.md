# Correlation Id

## Purpose

Correlation Id contains the code, configuration, or support files that implement this part of the harness architecture.

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

- Current on-disk inventory: 4 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
