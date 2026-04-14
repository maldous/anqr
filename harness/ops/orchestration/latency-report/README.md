# Latency Report

## Purpose

Directory for runtime service bootstrap or environment support; immediate files include `acceptable-ms.mjs`, `classify-latency.mjs`, `format-duration.mjs`, `generate-report.mjs`, and others.

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

- Current on-disk inventory: 10 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.
