# ANQR Core

## 1. Directory Overview

This directory contains shared harness configuration, state management, validation, and low-level runtime invariants for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It serves as the central foundation for queue management, concurrency control, worktree health monitoring, and result validation.

## 2. File Summaries

### Facade Modules (Auto-Generated)

These facade files re-export from sibling modules under matching directories, maintaining backwards compatibility after decomposition:

- **symphony-state.mjs** - Facade exporting from `./symphony-state/index.mjs`. Manages Symphony execution state, issue state tracking, and latency metrics collection.

- **symphony-validation.mjs** - Facade exporting from `./symphony-validation/index.mjs`. Provides validation logic for Symphony execution results.

- **bridge-result.mjs** - Facade exporting from `./bridge-result/index.mjs`. Contains helpers for normalizing and inferring Symphony results from completion data.

- **worktree-health.mjs** - Facade exporting from `./worktree-health/index.mjs` and `./worktree-health/runtime.mjs`. Implements worktree health monitoring and recovery logic.

- **worktree-config.mjs** - Facade exporting from `./worktree-config/index.mjs`. Worktree-specific configuration.

- **discord-source.mjs** - Facade exporting from `./discord-source/index.mjs`. Discord integration source handling.

### Core Implementation Files

- **symphony-config.mjs** - Centralized Symphony execution configuration. Single source of truth for queue, concurrency, and timeout parameters. Contains TARGET_MIN/TARGET_MAX (8/16), MAX_CONCURRENT_AGENTS (8), timing policy (HEARTBEAT_INTERVAL_MS, RECOVERY_GRACE_MS, STALE_THRESHOLD_MS, TASK_TIMEOUT_MS), QUEUE_STATES definitions, and runner configuration (RUNNER_MAX_TURNS=600, RUNNER_MAX_EXECUTION_MS=7.2M, RUNNER_MAX_RETRIES=10, etc.).

### Test Files

- **symphony-config.spec.ts** - Vitest test suite validating symphony-config.mjs values including queue targets, timeouts and thresholds, timing ordering invariants, linear integration, and runner configuration.

- **bridge-result.spec.ts** - Vitest test suite for bridge-result helpers including normalizeSymphonyResult and inferSymphonyResultFromCompletion functions.

- **symphony-state.spec.ts** - Vitest test suite for symphony-state.mjs latency tracking, including recordCompletion, getLatencyMetrics, and checkLatencyBaseline functions.

## 3. Overall Directory Function

This directory serves as the operational core of the ANQR harness. The files work together to provide:

- **Configuration Management**: symphony-config.mjs provides a single source of truth for all queue, concurrency, and timeout parameters, imported by linear-guardian.mjs, symphony-queue-control.mjs, and other orchestration scripts.

- **State Management**: symphony-state.mjs handles issue state tracking and latency metrics collection, enabling performance monitoring and baseline checking.

- **Result Validation**: bridge-result.mjs normalizes and infers Symphony execution results from completion data, ensuring consistent result handling.

- **Health Monitoring**: worktree-health.mjs implements worktree health monitoring and recovery logic to detect and recover from stuck worktrees.

- **Timing Policy**: The timing constants enforce strict ordering (HEARTBEAT_INTERVAL_MS < RECOVERY_GRACE_MS < LEASE_TTL < TASK_TIMEOUT_MS < STALE_THRESHOLD_MS < RUNNER_MAX_EXECUTION_MS) to ensure safe recovery behavior.

## 4. Usage Instructions

This directory is primarily imported by other harness modules rather than being run directly. Key usage patterns:

- Import configuration constants:

```javascript
import {
  TARGET_MIN,
  TARGET_MAX,
  MAX_CONCURRENT_AGENTS,
  TASK_TIMEOUT_MS,
} from "./symphony-config.mjs";
```

- Import state management functions:

```javascript
import { recordCompletion, getLatencyMetrics, checkLatencyBaseline } from "./symphony-state.mjs";
```

- Import validation helpers:

```javascript
import { normalizeSymphonyResult, inferSymphonyResultFromCompletion } from "./bridge-result.mjs";
```

- Run tests:

```bash
npx vitest run ops/core/
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **Vitest** - For test execution (vitest.config.js in project root)

### Internal Dependencies

- **../linear-client.mjs** - For LABELS constant in symphony-config.mjs

### Configuration Dependencies

- **ANQR_SYMPHONY_STATE_DIR** - Environment variable for state directory (used by symphony-state.mjs)

## 6. Additional Comments

- **Legacy Lessons**: symphony-config.mjs encodes lessons from Ollama deployment including GPU contention handling (reduced from 5-10 to 2-3 concurrent issues) and the need to actively drain queue health.

- **Timing Policy**: The chain ordering ensures safe recovery: HEARTBEAT_INTERVAL_MS (5min) < RECOVERY_GRACE_MS (10min) < LEASE_TTL (20min default) < TASK_TIMEOUT_MS (25min) < STALE_THRESHOLD_MS (30min) < RUNNER_MAX_EXECUTION_MS (120min).

- **Fail-Closed Design**: bridge-result.mjs uses fail-closed behavior - it does not infer completion from a "stop" finish reason, ensuring work is not marked complete without explicit confirmation.

- **Latency Baseline**: symphony-state.mjs tracks latency metrics (count, average, median, p95, min, max) and alerts when current latency exceeds baseline by more than 50%.
