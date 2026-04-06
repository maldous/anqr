# ANQR Ollama Local Audit

## 1. Directory Overview

This directory contains the Ollama local audit functionality for the ANQR (Agentic Number Query
Runner) harness. It provides a health check system that validates the local Ollama installation is
reachable, has the required model available, and can successfully generate responses. This module is
critical for ensuring the local AI inference pipeline is operational before attempting to route work
to it. It currently contains 14 files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-model-available.mjs** - Lists available models via `/api/tags` and verifies the pinned model (`qwen2.5-coder:3b-instruct`) is present. Records pass/fail with available model list on failure.
- **check-model-responds.mjs** - Sends a minimal prompt ("Reply OK") to the pinned model and verifies it generates tokens. Records pass/fail along with token count and elapsed time.
- **check-reachable.mjs** - Validates that Ollama API is accessible by calling the `/api/version` endpoint with a timeout. Records pass/fail status and includes the Ollama version in the result detail.
- **index.mjs** - Auto-generated facade that exports all public API members including `OLLAMA_BASE`, `PINNED_MODEL`, `PROMPT_TIMEOUT_MS`, `PING_TIMEOUT_MS`, `results`, `record`, `checkReachable`, `checkModelAvailable`, `checkModelResponds`, `main`, and `printSummary`. This is the canonical entry point for importing from this module.
- **logger.mjs** - Shared logger module that re-exports `logInfo` from the central logger at `../../../lib/logger.mjs`.
- **main.mjs** - Main orchestration module that runs the three-stage health check: first verifies Ollama is reachable, then checks if the pinned model is available, and finally verifies the model can generate responses. Exits with code 0 if all checks pass, 1 otherwise.
- **ollama-base.mjs** - Exports `OLLAMA_BASE` constant, defaulting to `http://localhost:11434` but configurable via `OLLAMA_API_BASE` environment variable.
- **ping-timeout-ms.mjs** - Exports `PING_TIMEOUT_MS` constant set to `5_000` (5 seconds) for the reachability check.
- **pinned-model.mjs** - Exports `PINNED_MODEL` constant set to `"qwen2.5-coder:3b-instruct"`.
- **print-summary.mjs** - Outputs a summary line showing the pass/total count (e.g., "3/3 checks passed").
- **prompt-timeout-ms.mjs** - Exports `PROMPT_TIMEOUT_MS` constant set to `60_000` (60 seconds) for the model response check.
- **record.mjs** - Helper function that adds an entry to the results array and logs it with a pass/fail emoji (checkmark or cross).
- **results.mjs** - Mutable array that stores all check results with name, pass status, detail, and timestamp.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`. Used for direct CLI execution.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/model/ollama-local-audit/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
