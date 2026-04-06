# ANQR Orchestration

## 1. Directory Overview

This directory contains the core Symphony harness orchestration scripts that manage the execution
pipeline for the ANQR (Agentic Number Query Runner) system. It provides the essential components for
concurrent AI-driven issue execution using git worktrees, queue management, and lease-based
concurrency control. The orchestration layer is the central operating engine that coordinates
multiple runners, manages worktree pools, and ensures reliable issue processing through the Symphony
execution pipeline. It currently contains 12 files and 9 subdirectories.

## 2. File Summaries

### Files

- **analyze-worktree-benchmark.mjs** - Benchmark analysis for worktree performance.
- **latency-report.mjs** - Latency reporting and analysis module.
- **nightly-ops-pass.mjs** - Nightly operations pass script for scheduled maintenance tasks.
- **reset-queue.mjs** - Standalone script to reset retry state and clear cooldowns for all Todo issues. Uses `resetRetryState` and `clearCooldown` from symphony-state.mjs and `listIssuesByState` from linear-client.mjs.
- **symphony-control.mjs** - Central control module for Symphony orchestration.
- **symphony-integrator.mjs** - Integration module that orchestrates the Symphony system components together.
- **symphony-queue-control.mjs** - Queue management for the Symphony execution pipeline. Handles queue health checks, feeding issues from Backlog to Todo, draining overflow issues from Todo to Backlog, enforcing concurrent limits, and detecting stuck work.
- **symphony-runner.mjs** - Main execution agent that picks up Linear issues and implements them via AI agent. Features include lease-based concurrency control, validation and commit workflow, provider routing via Symphony bridge, and worktree-aware execution for concurrent operations.
- **symphony-worktree-pool.mjs** - Git worktree pool management for concurrent Symphony execution. Provides create/destroy operations for Symphony worktrees, listing and monitoring worktree status, repairing corrupted worktrees, and automatic cleanup.
- **symphony-worktree-pool.mjs.d.ts** - TypeScript type definitions for the worktree pool module.
- **symphony-worktree-pool.spec.ts** - Vitest test suite for worktree pool disk space checks. Tests include checking disk space before creating worktrees, throwing errors on insufficient disk space, calculating required space correctly, and providing clear error messages with space requirements.
- **symphony-worktree-recovery.mjs** - Recovery operations for failed or corrupted worktrees.

### Child Directories

- **analyze-worktree-benchmark/** - This directory contains benchmarking and analysis tools for evaluating concurrent worktree execution performance in the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **latency-report/** - This directory contains the latency reporting module for the ANQR (Agentic Number Query Runner) harness.
- **nightly-ops-pass/** - This directory contains the nightly operations pass automation for the ANQR (Agentic Number Query Runner) harness.
- **symphony-control/** - This directory contains system control utilities for managing the ANQR (Agentic Number Query Runner) Symphony orchestration timers.
- **symphony-integrator/** - This directory contains the Symphony Integrator module for the ANQR (Agentic Number Query Runner) harness.
- **symphony-queue-control/** - This directory contains queue management automation for the ANQR (Agentic Number Query Runner) harness.
- **symphony-runner/** - This directory contains the core execution engine for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **symphony-worktree-pool/** - This directory contains the worktree pool management system for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **symphony-worktree-recovery/** - This directory contains worktree recovery automation for the ANQR (Agentic Number Query Runner) Symphony orchestration system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
