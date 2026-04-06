# ANQR Harness Doctor

## 1. Directory Overview

This directory contains the Harness Doctor diagnostic tool for the ANQR (Agentic Number Query Runner) harness system. It provides automated health checks and diagnostics to verify that the harness environment is properly configured and all required dependencies are in place before running the orchestration system.

## 2. File Summaries

### Main Entry Points

- **index.mjs** - Generated facade index that exports all public API members including `main`, `isMain`, `ROOT`, `__dirname`, and all check functions (`checkEnvVars`, `checkNodeModules`, `checkCreditGate`, `checkOllama`, `checkSystemdServices`, `checkQueueState`, `checkReportsDir`, `checkHarnessConfig`).

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()` when run as the entry point.

- **main.mjs** - Main orchestration module that runs all diagnostic checks in sequence. Outputs results to console with pass/fail icons and writes a detailed JSON report to `reports/doctor.json`.

### Diagnostic Check Modules

- **check-env-vars.mjs** - Validates critical environment variables (`LINEAR_API_KEY`, `CODEBUFF_API_KEY`) and optional ones (`OLLAMA_API_BASE`, `SONAR_TOKEN`). Checks for placeholder values like "REPLACE" or "REPLACE_WITH_REAL".

- **check-node-modules.mjs** - Verifies required npm packages are installed (`@codebuff/sdk`, `@modelcontextprotocol/sdk`) and checks for optional packages (`ollama`). Reports version information when available.

- **check-harness-config.mjs** - Validates presence of configuration files: `.env` and `harness/ops/integrations/model/litellm-config.yaml`.

- **check-credit-gate.mjs** - Attempts to import and probe the credit gate module to verify provider selection works. Returns the selected provider name on success.

- **check-ollama.mjs** - Probes the Ollama runtime at the configured base URL (default: http://localhost:11434). Checks version and lists available models.

- **check-systemd-services.mjs** - Checks status of systemd user services including `anqr-symphony-runner@1`, `anqr-symphony-runner@2`, `anqr-nightly`, and `anqr-queue-feeder`. Always passes since these are production runtime services.

- **check-queue-state.mjs** - Invokes the symphony-queue-control.mjs script with `--check` flag to report pending and processing queue counts.

- **check-reports-dir.mjs** - Validates the `reports/` directory exists and finds the most recent Codebuff run file with timestamp information.

### Utility Modules

- **root.mjs** - Exports `ROOT` constant pointing to project root (3 directories up from this module).

- **dirname.mjs** - ESM-compatible `__dirname` polyfill using `fileURLToPath`.

- **is-main.mjs** - Utility to detect if the module is being run directly as the entry point.

- **logger.mjs** - Shared logger module using the centralized logger from `../lib/logger.mjs`.

## 3. Overall Directory Function

The harness-doctor directory provides a comprehensive diagnostic suite that validates the ANQR harness environment before running. The diagnostic tool is typically run as part of startup or health-check routines to ensure all prerequisites are met.

The workflow: `main.mjs` iterates through all check functions, executes them in sequence, logs pass/fail status with icons, and generates a JSON report at `reports/doctor.json`. The exit code reflects overall health (0 = all passed, 1 = any failed).

This tool helps operators quickly identify misconfiguration issues, missing dependencies, or service failures that would prevent the harness from operating correctly.

## 4. Usage Instructions

### Running Harness Doctor

```bash
# Via facade (recommended)
node ops/harness-doctor/index.mjs

# Or via runtime
node ops/harness-doctor/runtime.mjs
```

### Interpreting Output

Each diagnostic category displays with an icon:

- ✅ Passed checks display with a checkmark icon
- ❌ Failed checks display with an X icon

The final line shows the overall pass/fail count.

### Report Output

A detailed JSON report is written to `reports/doctor.json` containing:

- `timestamp` - ISO timestamp of the run
- `summary` - counts of passed, failed, and total checks
- `results` - array of detailed results for each category including timing and raw data

### Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

## 5. Dependencies

### Internal Dependencies

- **../lib/logger.mjs** - Centralized logging utility
- **../integrations/model/symphony-credit-gate.mjs** - Credit gate module for provider selection probing
- **../symphony-queue-control.mjs** - Queue control script for queue state checks

### Required Environment Variables

- **LINEAR_API_KEY** - Required for Linear integration
- **CODEBUFF_API_KEY** - Required for Codebuff SDK access

### Optional Environment Variables

- **OLLAMA_API_BASE** - Ollama API endpoint (default: http://localhost:11434)
- **SONAR_TOKEN** - SonarQube authentication token
- **ANQR_HARNESS_DOCTOR_RUNNERS** - Comma-separated list of runner unit names to check (default: "anqr-symphony-runner@1,anqr-symphony-runner@2")

### Required Files

- **.env** - Environment configuration file in project root
- **harness/ops/integrations/model/litellm-config.yaml** - LiteLLM configuration

### Required Packages

- **@codebuff/sdk** - Codebuff SDK for AI operations
- **@modelcontextprotocol/sdk** - MCP SDK for model context protocol

### Optional Packages

- **ollama** - Local LLM runtime (if using Ollama provider)

### External Services

- **Ollama** - Local LLM runtime (optional, checked if OLLAMA_API_BASE is set)
- **Systemd** - Service manager for checking runner services

## 6. Additional Comments

- **Fail-Safe Design**: The tool is designed to continue running all checks even if some fail, providing a complete diagnostic picture.

- **Systemd Always Passes**: Systemd service checks always pass because these are production runtime services that may not be active in development environments.

- **Queue State is Informational**: Queue state check returns pass=true even if the queue is unreachable, as an empty queue is a valid state.

- **Credit Gate Probing**: The credit gate check attempts actual provider selection, which validates not just the module loading but also the complete provider routing logic.

- **Timeout Handling**: Ollama check uses a 5-second timeout with AbortController to prevent hanging on unreachable endpoints.

- **Report History**: The reports directory check specifically looks for files starting with "latest-" in the codebuff subdirectory to track recent Codebuff runs.
