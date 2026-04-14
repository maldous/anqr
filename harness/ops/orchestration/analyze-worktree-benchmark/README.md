# Analyze Worktree Benchmark

## Purpose
Analyze Worktree Benchmark contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 11 immediate files
- 0 child directories

## Key Files

- `compare-benchmarks.mjs` - Exports `compareBenchmarks`, the main helper defined in this file.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `evidence-dir.mjs` - Exports `EVIDENCE_DIR`, a shared constant or state value used by sibling modules.
- `extract-benchmark-metrics.mjs` - Exports `extractBenchmarkMetrics`, the main helper defined in this file.
- `generate-evidence-report.mjs` - Exports `generateEvidenceReport`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `reports-dir.mjs` - Exports `REPORTS_DIR`, a shared constant or state value used by sibling modules.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 11 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
