# ANQR Worktree Benchmark Analysis

## 1. Directory Overview

This directory contains benchmarking and analysis tools for evaluating concurrent worktree execution performance in the ANQR (Agentic Number Query Runner) Symphony orchestration system. The tools are designed to validate the ANQ-1104 worktree concurrent execution feature by comparing single-worktree baseline metrics against multi-worktree concurrent execution metrics.

## 2. File Summaries

### Main Entry Points

- **index.mjs** - Generated facade index that exports all public API members including path constants, metric extraction functions, benchmark comparison, and the main function.

- **runtime.mjs** - Runtime carry-forward module that imports and executes the main function when the file is run directly as a CLI script.

- **main.mjs** - Main orchestration module providing the CLI interface with three commands: `--extract` for extracting metrics from state.json, `--compare` for comparing two benchmark runs, and `--report` for running the full pipeline.

### Core Logic Modules

- **extract-benchmark-metrics.mjs** - Extracts benchmark metrics from the Symphony state file (`reports/symphony/state.json`) for a given time window. Calculates completed issues, throughput (issues/hour), git conflicts, and conflict rate. Returns detailed metrics including issue details with retry counts.

- **compare-benchmarks.mjs** - Compares baseline and concurrent benchmark runs to validate acceptance criteria. Checks for throughput increase (requires >=75%) and conflict rate (requires <5%). Returns a comparison object with pass/fail status and threshold validation.

- **generate-evidence-report.mjs** - Generates a Markdown evidence report (`worktree-benchmark-{date}.md`) in the evidence directory. The report includes executive summary, throughput comparison, conflict analysis, resource usage, stability metrics, acceptance criteria checklist, test configuration, and recommendations.

### Path and Configuration

- **project-root.mjs** - Resolves the project root path by navigating up from the current module location to the harness root.

- **reports-dir.mjs** - Defines the reports directory path (`reports/symphony`) relative to the project root.

- **evidence-dir.mjs** - Defines the evidence directory path (`docs/harness/evidence`) for storing generated benchmark reports.

- **dirname.mjs** - ESM-compatible `__dirname` polyfill using `fileURLToPath` and `dirname`.

### Logging

- **logger.mjs** - Shared logger module that wraps the common logger from `../../lib/logger.mjs`, exporting `logInfo` and `logError` functions.

## 3. Overall Directory Function

This directory serves as the validation and benchmarking layer for the ANQ-1104 worktree concurrent execution feature. The tools work together to:

1. **Extract metrics** from the Symphony state file for a given time window, counting completed issues and detecting git-related conflicts
2. **Compare benchmarks** between baseline (single worktree) and concurrent (multi-worktree) configurations
3. **Generate evidence reports** documenting the comparison results with pass/fail status

The acceptance criteria validate that:
- Throughput increases by at least 75% when running with 2 worktrees vs 1 worktree
- Conflict rate stays below 5% during concurrent execution

If validation passes, the report recommends updating `MAX_CONCURRENT_AGENTS` in `symphony-config.mjs`, enabling the production worktree pool, and configuring systemd timers. If validation fails, it recommends creating remediation issues and rolling back to single-runner mode.

## 4. Usage Instructions

### Extract Baseline Metrics (1 worktree)

```bash
node ops/orchestration/analyze-worktree-benchmark.mjs --extract "2026-01-01T10:00:00Z" "2026-01-01T14:00:00Z" 1 > baseline.json
```

### Extract Concurrent Metrics (2 worktrees)

```bash
node ops/orchestration/analyze-worktree-benchmark.mjs --extract "2026-01-01T16:00:00Z" "2026-01-01T20:00:00Z" 2 > concurrent.json
```

### Compare and Generate Evidence Report

```bash
node ops/orchestration/analyze-worktree-benchmark.mjs --compare baseline.json concurrent.json
```

### Full Pipeline (Extract + Compare + Report)

```bash
node ops/orchestration/analyze-worktree-benchmark.mjs --report <start-baseline> <end-baseline> <start-concurrent> <end-concurrent> <concurrent-worktrees>
```

### View Help

```bash
node ops/orchestration/analyze-worktree-benchmark.mjs --help
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Shared logger module used for logging info and error messages
- **reports/symphony/state.json** - Source data file containing Symphony issue state transitions

### External Requirements

- **Node.js** - ESM modules with .mjs extension
- **Valid state file** - The `reports/symphony/state.json` file must exist with valid issue transition data

### Output Dependencies

- **docs/harness/evidence/** - Directory where generated evidence reports are written
- **reports/symphony/benchmark-results.json** - Intermediate results file created by the `--report` command

## 6. Additional Comments

- **Validation Phase**: This tool supports Phase 2 (ANQ-1104) validation of the worktree concurrent execution feature. Phase 1 would be unit testing, and Phase 3 would be production monitoring for 7 days after successful validation.

- **Conflict Detection**: Git conflicts are detected by filtering issue transitions for keywords: "git", "conflict", "merge", or "push".

- **Time Window**: All metrics are filtered to the specified start/end time window to ensure accurate comparison between baseline and concurrent runs.

- **Resource Metrics**: Resource metrics (CPU, memory, disk I/O) are currently placeholders marked as "N/A" - they represent future extensibility for system resource monitoring.

- **Acceptance Criteria**: Some criteria require manual verification: memory leaks/disk space exhaustion, worktree corruption, and resource usage limits. These cannot be automatically validated by the tool.