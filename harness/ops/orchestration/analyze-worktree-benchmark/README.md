# ANQR Worktree Benchmark Analysis

## 1. Directory Overview

This directory implements **ANQR Worktree Benchmark Analysis** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 11 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **compare-benchmarks.mjs** - Exports `compareBenchmarks`, which compares benchmarks.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **evidence-dir.mjs** - Exports `EVIDENCE_DIR`, a shared constant used by sibling modules.
- **extract-benchmark-metrics.mjs** - Exports `extractBenchmarkMetrics`, which implements extract benchmark metrics.
- **generate-evidence-report.mjs** - Exports `generateEvidenceReport`, which implements generate evidence report.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./project-root.mjs`, `./reports-dir.mjs`, `./evidence-dir.mjs`, `./extract-benchmark-metrics.mjs`, `./compare-benchmarks.mjs`, and 2 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **reports-dir.mjs** - Exports `REPORTS_DIR`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, timer, scheduling, cooldown, or watchdog behavior, Symphony integration, and git/worktree awareness.

## 4. Usage Instructions

```bash
node ops/orchestration/analyze-worktree-benchmark/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../lib/logger.mjs`, `./compare-benchmarks.mjs`, `./dirname.mjs`, `./evidence-dir.mjs`, `./extract-benchmark-metrics.mjs`, `./generate-evidence-report.mjs`, `./index.mjs`, `./logger.mjs`, `./project-root.mjs`, `./reports-dir.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
