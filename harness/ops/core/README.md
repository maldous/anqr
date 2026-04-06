# ANQR Core

## 1. Directory Overview

This directory contains shared harness configuration, state management, validation, and low-level
runtime invariants for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It
serves as the central foundation for queue management, concurrency control, worktree health
monitoring, and result validation. It currently contains 10 files and 6 subdirectories.

## 2. File Summaries

### Files

- **bridge-result.mjs** - Facade exporting from `./bridge-result/index.mjs`. Contains helpers for normalizing and inferring Symphony results from completion data.
- **bridge-result.spec.ts** - Vitest test suite for bridge-result helpers including normalizeSymphonyResult and inferSymphonyResultFromCompletion functions.
- **discord-source.mjs** - Facade exporting from `./discord-source/index.mjs`. Discord integration source handling.
- **symphony-config.mjs** - Centralized Symphony execution configuration. Single source of truth for queue, concurrency, and timeout parameters. Contains TARGET_MIN/TARGET_MAX (8/16), MAX_CONCURRENT_AGENTS (8), timing policy (HEARTBEAT_INTERVAL_MS, RECOVERY_GRACE_MS, STALE_THRESHOLD_MS, TASK_TIMEOUT_MS), QUEUE_STATES definitions, and runner configuration (RUNNER_MAX_TURNS=600, RUNNER_MAX_EXECUTION_MS=7.2M, RUNNER_MAX_RETRIES=10, etc.).
- **symphony-config.spec.ts** - Vitest test suite validating symphony-config.mjs values including queue targets, timeouts and thresholds, timing ordering invariants, linear integration, and runner configuration.
- **symphony-state.mjs** - Facade exporting from `./symphony-state/index.mjs`. Manages Symphony execution state, issue state tracking, and latency metrics collection.
- **symphony-state.spec.ts** - Vitest test suite for symphony-state.mjs latency tracking, including recordCompletion, getLatencyMetrics, and checkLatencyBaseline functions.
- **symphony-validation.mjs** - Facade exporting from `./symphony-validation/index.mjs`. Provides validation logic for Symphony execution results.
- **worktree-config.mjs** - Facade exporting from `./worktree-config/index.mjs`. Worktree-specific configuration.
- **worktree-health.mjs** - Facade exporting from `./worktree-health/index.mjs` and `./worktree-health/runtime.mjs`. Implements worktree health monitoring and recovery logic.

### Child Directories

- **bridge-result/** - This directory contains utility functions for normalizing and validating Symphony bridge results.
- **discord-source/** - This directory contains utilities for detecting and marking Linear issues that originate from Discord.
- **symphony-state/** - This directory contains the core state management system for the ANQR (Agentic Number Query Runner) Symphony orchestration.
- **symphony-validation/** - This directory contains the validation engine for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **worktree-config/** - This directory contains shared worktree configuration constants and utilities for the ANQR (Agentic Number Query Runner) harness.
- **worktree-health/** - This directory contains worktree health monitoring and recovery logic for the ANQR (Agentic Number Query Runner) harness system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Imported packages** - Representative external dependencies referenced here include `vitest`.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
