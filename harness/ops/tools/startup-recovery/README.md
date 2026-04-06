# ANQR Startup Recovery

## 1. Directory Overview

This directory contains startup recovery tooling for the ANQR (Agentic Number Query Runner) system.
It handles system startup recovery after downtime, checking and enabling services, timers, queue
health, and cleaning up stale state. The recovery automation ensures the Linear webhook system
returns to operational status after a restart or system failure. It currently contains 5 files and 0
subdirectories.

## 2. File Summaries

### Files

- **index.mjs** - Generated facade index that exports `runCommand` from `./run-command.mjs` and `main` from `./main.mjs`.
- **logger.mjs** - Shared logger module that creates a logger using the project's standard logger from `../../lib/logger.mjs`. Exports `logInfo`, `logWarn`, and `logError` functions.
- **main.mjs** - Main recovery logic implementing a 6-step recovery process:
- **run-command.mjs** - Utility function for running shell commands via `execFileSync`. Returns an object with `success` (boolean), and either `output` (on success) or `error`/`stderr` (on failure).
- **runtime.mjs** - Generated runtime carry-forward that imports and executes `main()` from `./index.mjs`.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/tools/startup-recovery/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
