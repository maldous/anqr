# ANQR Symphony Validation

## 1. Directory Overview

This directory contains the validation engine for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It provides a comprehensive validation pipeline that runs type checking, linting, spell checking, AST density analysis, and unit tests to ensure code quality and catch issues before deployment.

## 2. File Summaries

### Core Execution

- **run-command.mjs** - Core command execution wrapper. Uses `execFileSync` for synchronous execution when no heartbeat is needed, and delegates to `runCommandWithHeartbeat` when heartbeat monitoring is required. Handles output trimming and error aggregation.

- **run-command-with-heartbeat.mjs** - Implements command execution with periodic heartbeat monitoring. Sends heartbeats every 60 seconds to detect stuck processes. Handles initial, periodic, and final heartbeat phases. Includes timeout support and graceful process termination on heartbeat failure.

- **trim-output.mjs** - Utility to trim command output to a maximum length (default 6000 characters) to prevent buffer overflow and log spam.

### Validation Runners

- **run-typecheck.mjs** - Executes TypeScript type checking using `tsc --noEmit`. Uses file locking (`flock`) to prevent concurrent typecheck runs. Configured with 240s timeout and 2GB Node memory limit.

- **run-lint.mjs** - Runs oxlint with the project's oxlint configuration. Checks src/, packages/, and harness/ directories. Fails if any warnings are found. Timeout: 60s.

- **run-cspell.mjs** - Runs cspell for spell checking. Supports changed-files-only mode (filters by file extension) or full project mode using predefined globs. Timeout: 60s.

- **run-ast-density.mjs** - Runs AST density auditing via `audit-ast-density.mjs`. Validates that code doesn't exceed 1 AST node per line threshold. Supports changed-only or full project mode. Timeout: 120s.

- **run-tests.mjs** - Runs unit tests using Vitest. Uses file locking to prevent concurrent runs. Excludes gallery-scan-matrix, overlay-preservation-mode-audit, and qr-generator-perf-profile spec files. Sets `ANQR_LOG_LEVEL=error`. Timeout: 240s.

- **run-global-preflights.mjs** - Orchestrates all global preflight validations: typecheck, lint, cspell, and ast-density. Runs sequentially and returns early on first failure.

- **run-validation.mjs** - Main validation orchestrator that runs all five validation checks: typecheck, lint, cspell, ast-density, and test-unit. Aggregates results and computes a failure signature for error tracking.

### Utilities

- **filter-changed-files.mjs** - Filters a list of changed files by a regex pattern (typically file extensions).

- **validation-manifest-hash.mjs** - Computes SHA256 hash of the validation manifest for cache invalidation and change detection.

- **format-validation-feedback.mjs** - Formats validation failure messages into user-friendly output with check names, truncated details, and instructions for fixing errors.

### Configuration

- **validation-manifest.mjs** - Central configuration for all validation commands, timeouts, and file patterns. Defines: typecheck (tsc with flock, 240s), lint (oxlint, 60s), cspell (60s), ast-density (120s), tests (vitest with flock, 240s).

### Facade

- **index.mjs** - Generated facade that exports all public functions from the directory for convenient imports.

## 3. Overall Directory Function

This directory serves as the validation layer for the ANQR Symphony system. The files work together to provide:

- **Validation Pipeline**: `run-validation.mjs` orchestrates five validation checks that run sequentially: typecheck, lint, cspell, ast-density, and test-unit.

- **Heartbeat Monitoring**: Long-running validations (typecheck, lint, tests) support optional heartbeat callbacks to detect stuck processes and prevent queue blocking.

- **File Locking**: Typecheck and tests use `flock` to prevent concurrent runs that could cause resource contention.

- **Failure Tracking**: The validation system computes a failure signature from failed checks and their error messages, useful for debugging and change detection.

- **Feedback Formatting**: `format-validationFeedback` generates actionable error messages with specific instructions for developers.

The validation system is invoked by the Symphony orchestrator to ensure code quality before marking issues as complete.

## 4. Usage Instructions

This directory is primarily imported by other harness modules. Key usage patterns:

```javascript
// Run all validations
import { runValidation } from "./ops/core/symphony-validation/index.mjs";
const result = await runValidation(projectRoot, changedFiles, { heartbeat: myHeartbeatFn });

// Run specific validation
import { runTypecheck, runLint, runTests } from "./ops/core/symphony-validation/index.mjs";
await runTypecheck(projectRoot, { heartbeat: myHeartbeatFn });

// Run global preflights (typecheck, lint, cspell, ast-density)
import { runGlobalPreflights } from "./ops/core/symphony-validation/index.mjs";
await runGlobalPreflights(projectRoot);

// Format validation feedback for user display
import { formatValidationFeedback } from "./ops/core/symphony-validation/index.mjs";
const message = formatValidationFeedback(validationResult);
```

All runners accept a `projectRoot` path and optional `opts` object with `heartbeat` function for monitoring.

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **TypeScript** - For typecheck (via npx tsc)
- **oxlint** - For linting (via npx oxlint)
- **cspell** - For spell checking (via npx cspell)
- **Vitest** - For test execution (via npx vitest)
- **audit-ast-density.mjs** - For AST density checking

### Internal Dependencies

- **../symphony-config.mjs** - Not directly used, but validation config aligns with Symphony timing

### External Tools

- **flock** - For file locking (typecheck and tests)
- **/bin/sh** - For command execution

### Environment Variables

- **NODE_OPTIONS** - Set to `--max-old-space-size=2048` for typecheck
- **ANQR_LOG_LEVEL** - Set to `error` for test runs

## 6. Additional Comments

- **Sequential Execution**: Validation checks run sequentially (not parallel) to avoid resource contention and ensure deterministic results.

- **Fail-Fast**: Both `runGlobalPreflights` and `runValidation` use fail-fast behavior - they stop on the first failure rather than running all checks.

- **Heartbeat Integration**: The heartbeat system is critical for long-running validations in the Symphony queue context. It allows the orchestrator to detect stuck processes and recover gracefully.

- **Lock Files**: Typecheck and tests use `/tmp/anqr-typecheck.lock` and `/tmp/anqr-vitest.lock` respectively to prevent concurrent execution that could cause OOM or resource exhaustion.

- **Output Truncation**: All command outputs are truncated to 6000 characters to prevent log overflow while preserving enough context for debugging.

- **Excluded Tests**: Three test files are excluded from the validation suite (gallery-scan-matrix, overlay-preservation-mode-audit, qr-generator-perf-profile) likely due to resource intensity or flakiness.
