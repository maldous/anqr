# ANQR Symphony Validation

## 1. Directory Overview

This directory contains the validation engine for the ANQR (Agentic Number Query Runner) Symphony
orchestration system. It provides a comprehensive validation pipeline that runs type checking,
linting, spell checking, AST density analysis, and unit tests to ensure code quality and catch
issues before deployment. It currently contains 15 files and 0 subdirectories.

## 2. File Summaries

### Files

- **filter-changed-files.mjs** - Filters a list of changed files by a regex pattern (typically file extensions).
- **format-validation-feedback.mjs** - Formats validation failure messages into user-friendly output with check names, truncated details, and instructions for fixing errors.
- **index.mjs** - Generated facade that exports all public functions from the directory for convenient imports.
- **run-ast-density.mjs** - Runs AST density auditing via `audit-ast-density.mjs`. Validates that code doesn't exceed 1 AST node per line threshold. Supports changed-only or full project mode. Timeout: 120s.
- **run-command-with-heartbeat.mjs** - Implements command execution with periodic heartbeat monitoring. Sends heartbeats every 60 seconds to detect stuck processes. Handles initial, periodic, and final heartbeat phases. Includes timeout support and graceful process termination on heartbeat failure.
- **run-command.mjs** - Core command execution wrapper. Uses `execFileSync` for synchronous execution when no heartbeat is needed, and delegates to `runCommandWithHeartbeat` when heartbeat monitoring is required. Handles output trimming and error aggregation.
- **run-cspell.mjs** - Runs cspell for spell checking. Supports changed-files-only mode (filters by file extension) or full project mode using predefined globs. Timeout: 60s.
- **run-global-preflights.mjs** - Orchestrates all global preflight validations: typecheck, lint, cspell, and ast-density. Runs sequentially and returns early on first failure.
- **run-lint.mjs** - Runs oxlint with the project's oxlint configuration. Checks src/, packages/, and harness/ directories. Fails if any warnings are found. Timeout: 60s.
- **run-tests.mjs** - Runs unit tests using Vitest. Uses file locking to prevent concurrent runs. Excludes gallery-scan-matrix, overlay-preservation-mode-audit, and qr-generator-perf-profile spec files. Sets `ANQR_LOG_LEVEL=error`. Timeout: 240s.
- **run-typecheck.mjs** - Executes TypeScript type checking using `tsc --noEmit`. Uses file locking (`flock`) to prevent concurrent typecheck runs. Configured with 240s timeout and 2GB Node memory limit.
- **run-validation.mjs** - Main validation orchestrator that runs all five validation checks: typecheck, lint, cspell, ast-density, and test-unit. Aggregates results and computes a failure signature for error tracking.
- **trim-output.mjs** - Utility to trim command output to a maximum length (default 6000 characters) to prevent buffer overflow and log spam.
- **validation-manifest-hash.mjs** - Computes SHA256 hash of the validation manifest for cache invalidation and change detection.
- **validation-manifest.mjs** - Central configuration for all validation commands, timeouts, and file patterns. Defines: typecheck (tsc with flock, 240s), lint (oxlint, 60s), cspell (60s), ast-density (120s), tests (vitest with flock, 240s).

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
