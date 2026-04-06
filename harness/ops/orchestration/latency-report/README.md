# ANQR Latency Report

## 1. Directory Overview

This directory implements **ANQR Latency Report** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 10 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **acceptable-ms.mjs** - Exports `ACCEPTABLE_MS`, a shared constant used by sibling modules.
- **classify-latency.mjs** - Exports `classifyLatency`, which implements classify latency.
- **format-duration.mjs** - Exports `formatDuration`, which formats duration.
- **generate-report.mjs** - Exports `generateReport`, which implements generate report.
- **get-latency-color.mjs** - Exports `getLatencyColor`, which gets latency color.
- **index.mjs** - Facade module that re-exports public members from `./target-ms.mjs`, `./acceptable-ms.mjs`, `./format-duration.mjs`, `./classify-latency.mjs`, `./get-latency-color.mjs`, `./generate-report.mjs`, and 1 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`, `logWarn`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.
- **target-ms.mjs** - Exports `TARGET_MS`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include Discord integration, OpenClaw integration, and Symphony integration.

## 4. Usage Instructions

```bash
node ops/orchestration/latency-report/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../core/symphony-state.mjs`, `../../integrations/notifications/openclaw-discord.mjs`, `../../lib/logger.mjs`, `./acceptable-ms.mjs`, `./classify-latency.mjs`, `./format-duration.mjs`, `./generate-report.mjs`, `./get-latency-color.mjs`, `./index.mjs`, `./logger.mjs`, `./target-ms.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
