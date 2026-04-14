# Latency Report

## Purpose

Latency Report contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 10 immediate files
- 0 child directories

## Key Files

- `acceptable-ms.mjs` - Exports `ACCEPTABLE_MS`, a shared constant or state value used by sibling modules.
- `classify-latency.mjs` - Exports `classifyLatency`, the main helper defined in this file.
- `format-duration.mjs` - Exports `formatDuration`, the main helper defined in this file.
- `generate-report.mjs` - Exports `generateReport`, the main helper defined in this file.
- `get-latency-color.mjs` - Exports `getLatencyColor`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `target-ms.mjs` - Exports `TARGET_MS`, a shared constant or state value used by sibling modules.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 10 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
