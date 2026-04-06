# ANQR Worktree Benchmark Analysis

## 1. Directory Overview

This directory contains benchmarking and analysis tools for evaluating concurrent worktree execution
performance in the ANQR (Agentic Number Query Runner) Symphony orchestration system. The tools are
designed to validate the ANQ-1104 worktree concurrent execution feature by comparing single-worktree
baseline metrics against multi-worktree concurrent execution metrics. It currently contains 11 files
and 0 subdirectories.

## 2. File Summaries

### Files

- **compare-benchmarks.mjs** - Compares baseline and concurrent benchmark runs to validate acceptance criteria. Checks for throughput increase (requires >=75%) and conflict rate (requires <5%). Returns a comparison object with pass/fail status and threshold validation.
- **dirname.mjs** - ESM-compatible `__dirname` polyfill using `fileURLToPath` and `dirname`.
- **evidence-dir.mjs** - Defines the evidence directory path (`docs/harness/evidence`) for storing generated benchmark reports.
- **extract-benchmark-metrics.mjs** - Extracts benchmark metrics from the Symphony state file (`reports/symphony/state.json`) for a given time window. Calculates completed issues, throughput (issues/hour), git conflicts, and conflict rate. Returns detailed metrics including issue details with retry counts.
- **generate-evidence-report.mjs** - Generates a Markdown evidence report (`worktree-benchmark-{date}.md`) in the evidence directory. The report includes executive summary, throughput comparison, conflict analysis, resource usage, stability metrics, acceptance criteria checklist, test configuration, and recommendations.
- **index.mjs** - Generated facade index that exports all public API members including path constants, metric extraction functions, benchmark comparison, and the main function.
- **logger.mjs** - Shared logger module that wraps the common logger from `../../lib/logger.mjs`, exporting `logInfo` and `logError` functions.
- **main.mjs** - Main orchestration module providing the CLI interface with three commands: `--extract` for extracting metrics from state.json, `--compare` for comparing two benchmark runs, and `--report` for running the full pipeline.
- **project-root.mjs** - Resolves the project root path by navigating up from the current module location to the harness root.
- **reports-dir.mjs** - Defines the reports directory path (`reports/symphony`) relative to the project root.
- **runtime.mjs** - Runtime carry-forward module that imports and executes the main function when the file is run directly as a CLI script.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/analyze-worktree-benchmark/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
