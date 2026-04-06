# ANQR Orchestration

## 1. Directory Overview

This directory contains the core Symphony harness orchestration scripts that manage the execution pipeline for the ANQR (Agentic Number Query Runner) system. It provides the essential components for concurrent AI-driven issue execution using git worktrees, queue management, and lease-based concurrency control. The orchestration layer is the central operating engine that coordinates multiple runners, manages worktree pools, and ensures reliable issue processing through the Symphony execution pipeline.

## 2. File Summaries

### Facade Modules (Auto-Generated)

These facade files re-export from sibling modules under matching directories, maintaining backwards compatibility after decomposition:

- **symphony-runner.mjs** - Main execution agent that picks up Linear issues and implements them via AI agent. Features include lease-based concurrency control, validation and commit workflow, provider routing via Symphony bridge, and worktree-aware execution for concurrent operations.

- **symphony-queue-control.mjs** - Queue management for the Symphony execution pipeline. Handles queue health checks, feeding issues from Backlog to Todo, draining overflow issues from Todo to Backlog, enforcing concurrent limits, and detecting stuck work.

- **symphony-worktree-pool.mjs** - Git worktree pool management for concurrent Symphony execution. Provides create/destroy operations for Symphony worktrees, listing and monitoring worktree status, repairing corrupted worktrees, and automatic cleanup.

- **symphony-integrator.mjs** - Integration module that orchestrates the Symphony system components together.

- **symphony-control.mjs** - Central control module for Symphony orchestration.

- **nightly-ops-pass.mjs** - Nightly operations pass script for scheduled maintenance tasks.

- **symphony-worktree-recovery.mjs** - Recovery operations for failed or corrupted worktrees.

- **latency-report.mjs** - Latency reporting and analysis module.

- **analyze-worktree-benchmark.mjs** - Benchmark analysis for worktree performance.

### Utility Scripts

- **reset-queue.mjs** - Standalone script to reset retry state and clear cooldowns for all Todo issues. Uses `resetRetryState` and `clearCooldown` from symphony-state.mjs and `listIssuesByState` from linear-client.mjs.

### Type Definitions

- **symphony-worktree-pool.mjs.d.ts** - TypeScript type definitions for the worktree pool module.

### Test Files

- **symphony-worktree-pool.spec.ts** - Vitest test suite for worktree pool disk space checks. Tests include checking disk space before creating worktrees, throwing errors on insufficient disk space, calculating required space correctly, and providing clear error messages with space requirements.

## 3. Overall Directory Function

This directory serves as the operational core of the ANQR harness system. The orchestration scripts work together to provide a robust execution pipeline:

- **Issue Execution**: The symphony-runner.mjs picks up Linear issues and executes them using AI agents with provider routing through the Symphony bridge.

- **Queue Management**: symphony-queue-control.mjs maintains queue health by feeding issues from Backlog to Todo, draining overflow, and enforcing concurrent limits.

- **Concurrent Execution**: symphony-worktree-pool.mjs manages git worktrees enabling parallel execution. Each worktree runs independently with its own working directory, Git branch, and lock file.

- **Lease System**: The lease system in symphony-state.mjs prevents concurrent work on the same issue. Leases expire after inactivity (default: 20 minutes) and background heartbeats keep them alive during execution.

- **Recovery**: symphony-worktree-recovery.mjs handles recovery operations for failed or stuck worktrees.

- **Worktree Lifecycle**: Worktrees cycle through states: AVAILABLE (worktree exists, no active runner) -> ACTIVE (runner executing issue) -> SYNCING (sync with main, cleanup) -> AVAILABLE (ready for next issue).

## 4. Usage Instructions

### Running symphony-runner.mjs

```bash
# Single execution cycle
node harness/ops/orchestration/symphony-runner.mjs --once

# Dry run (no changes)
node harness/ops/orchestration/symphony-runner.mjs --once --dry-run

# Show status
node harness/ops/orchestration/symphony-runner.mjs --status
```

**Worktree support:** Set `ANQR_WORKTREE_ID` and `ANQR_WORKTREE_PATH` environment variables to run in a worktree. Running from the main repository without worktree context is rejected by the runner.

### Running symphony-queue-control.mjs

```bash
# Check queue health
node harness/ops/orchestration/symphony-queue-control.mjs --check

# Feed issues from Backlog to Todo
node harness/ops/orchestration/symphony-queue-control.mjs --feed

# Drain overflow issues from Todo to Backlog
node harness/ops/orchestration/symphony-queue-control.mjs --drain

# Enforce concurrent limits and detect stuck work
node harness/ops/orchestration/symphony-queue-control.mjs --enforce

# Run all operations
node harness/ops/orchestration/symphony-queue-control.mjs --all

# Dry run (no changes)
node harness/ops/orchestration/symphony-queue-control.mjs --all --dry-run
```

### Running symphony-worktree-pool.mjs

```bash
# Initialize worktree pool (default: 2 worktrees)
node harness/ops/orchestration/symphony-worktree-pool.mjs init [count]

# Initialize with 4 worktrees
node harness/ops/orchestration/symphony-worktree-pool.mjs init 4

# Show worktree status (human-readable)
node harness/ops/orchestration/symphony-worktree-pool.mjs status

# List worktrees (JSON output)
node harness/ops/orchestration/symphony-worktree-pool.mjs list

# Repair corrupted worktrees
node harness/ops/orchestration/symphony-worktree-pool.mjs repair

# Cleanup all Symphony worktrees
node harness/ops/orchestration/symphony-worktree-pool.mjs cleanup
```

**Worktree naming:**
- Worktrees: `/home/user/src/anqr-wt1`, `/home/user/src/anqr-wt2`, etc.
- Branches: `symphony/wt1`, `symphony/wt2`, etc.

### Running reset-queue.mjs

```bash
node harness/ops/orchestration/reset-queue.mjs
```

This resets retry state and clears cooldowns for all Todo issues.

## 5. Dependencies

### Internal Dependencies

- **../core/symphony-config.mjs** - Configuration for concurrency limits, timeouts, and queue targets
- **../core/symphony-state.mjs** - State management, lease system, and latency tracking
- **../core/bridge-result.mjs** - Result normalization helpers
- **../integrations/linear/linear-client.mjs** - Linear API client for issue operations
- **../lib/logger.mjs** - Logging utilities
- **../core/worktree-config.mjs** - Worktree-specific configuration

### External Services

- **Linear** - Issue tracking platform
- **Git** - Version control for worktree operations
- **Symphony bridge** - AI provider routing service (port 4319)

### System Requirements

- Node.js with ESM support (.mjs files)
- Git with worktree support
- systemd (for production deployment with timers)
- Sufficient disk space for worktrees (~0.2 GB per worktree)

## 6. Additional Comments

- **Concurrent Execution Model**: This is the canonical execution mode for Symphony runners. Multiple worktrees enable parallel issue processing, with each runner instance mapped to a specific worktree.

- **Lock System**: Locks are worktree-specific, stored at `/run/user/${UID}/symphony-runner/lock-wt1`. The main worktree uses `/run/user/${UID}/symphony-runner/lock-main`. File-based locking in `reports/symphony/state.json` ensures atomicity for shared state.

- **Scaling**: Add more concurrent runners by creating additional worktrees and enabling corresponding systemd timer instances. Scale down by disabling timer instances (worktrees can be kept for future use).

- **Production Deployment**: Use systemd template services (`anqr-symphony-runner@.service` and `.timer`) for automatic scheduled execution. Each worktree gets its own timer and service instance.

- **Configuration**: Edit `harness/ops/core/symphony-config.mjs` to adjust `MAX_CONCURRENT_AGENTS`, `TARGET_MIN`/`TARGET_MAX`, `RUNNER_MAX_EXECUTION_MS`, `HEARTBEAT_INTERVAL_MS`, and `RECOVERY_GRACE_MS`.

- **Documentation**: See [WORKTREE-QUICKSTART.md](/home/user/src/anqr/docs/harness/WORKTREE-QUICKSTART.md) for a 10-minute setup guide and [12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md) for comprehensive documentation.