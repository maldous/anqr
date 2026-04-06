# ANQR Harness Doctor

## 1. Directory Overview

This directory contains the Harness Doctor diagnostic tool for the ANQR (Agentic Number Query
Runner) harness system. It provides automated health checks and diagnostics to verify that the
harness environment is properly configured and all required dependencies are in place before running
the orchestration system. It currently contains 15 files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-credit-gate.mjs** - Attempts to import and probe the credit gate module to verify provider selection works. Returns the selected provider name on success.
- **check-env-vars.mjs** - Validates critical environment variables (`LINEAR_API_KEY`, `CODEBUFF_API_KEY`) and optional ones (`OLLAMA_API_BASE`, `SONAR_TOKEN`). Checks for placeholder values like "REPLACE" or "REPLACE_WITH_REAL".
- **check-harness-config.mjs** - Validates presence of configuration files: `.env` and `harness/ops/integrations/model/litellm-config.yaml`.
- **check-node-modules.mjs** - Verifies required npm packages are installed (`@codebuff/sdk`, `@modelcontextprotocol/sdk`) and checks for optional packages (`ollama`). Reports version information when available.
- **check-ollama.mjs** - Probes the Ollama runtime at the configured base URL (default: http://localhost:11434). Checks version and lists available models.
- **check-queue-state.mjs** - Invokes the symphony-queue-control.mjs script with `--check` flag to report pending and processing queue counts.
- **check-reports-dir.mjs** - Validates the `reports/` directory exists and finds the most recent Codebuff run file with timestamp information.
- **check-systemd-services.mjs** - Checks status of systemd user services including `anqr-symphony-runner@1`, `anqr-symphony-runner@2`, `anqr-nightly`, and `anqr-queue-feeder`. Always passes since these are production runtime services.
- **dirname.mjs** - ESM-compatible `__dirname` polyfill using `fileURLToPath`.
- **index.mjs** - Generated facade index that exports all public API members including `main`, `isMain`, `ROOT`, `__dirname`, and all check functions (`checkEnvVars`, `checkNodeModules`, `checkCreditGate`, `checkOllama`, `checkSystemdServices`, `checkQueueState`, `checkReportsDir`, `checkHarnessConfig`).
- **is-main.mjs** - Utility to detect if the module is being run directly as the entry point.
- **logger.mjs** - Shared logger module using the centralized logger from `../lib/logger.mjs`.
- **main.mjs** - Main orchestration module that runs all diagnostic checks in sequence. Outputs results to console with pass/fail icons and writes a detailed JSON report to `reports/doctor.json`.
- **root.mjs** - Exports `ROOT` constant pointing to project root (3 directories up from this module).
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()` when run as the entry point.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/harness-doctor/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
