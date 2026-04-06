# ANQR Ollama Local Audit

## 1. Directory Overview

This directory contains the Ollama local audit functionality for the ANQR (Agentic Number Query Runner) harness. It provides a health check system that validates the local Ollama installation is reachable, has the required model available, and can successfully generate responses. This module is critical for ensuring the local AI inference pipeline is operational before attempting to route work to it.

## 2. File Summaries

### Facade Modules (Auto-Generated)

- **index.mjs** - Auto-generated facade that exports all public API members including `OLLAMA_BASE`, `PINNED_MODEL`, `PROMPT_TIMEOUT_MS`, `PING_TIMEOUT_MS`, `results`, `record`, `checkReachable`, `checkModelAvailable`, `checkModelResponds`, `main`, and `printSummary`. This is the canonical entry point for importing from this module.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`. Used for direct CLI execution.

### Core Implementation Files

- **main.mjs** - Main orchestration module that runs the three-stage health check: first verifies Ollama is reachable, then checks if the pinned model is available, and finally verifies the model can generate responses. Exits with code 0 if all checks pass, 1 otherwise.

- **check-reachable.mjs** - Validates that Ollama API is accessible by calling the `/api/version` endpoint with a timeout. Records pass/fail status and includes the Ollama version in the result detail.

- **check-model-available.mjs** - Lists available models via `/api/tags` and verifies the pinned model (`qwen2.5-coder:3b-instruct`) is present. Records pass/fail with available model list on failure.

- **check-model-responds.mjs** - Sends a minimal prompt ("Reply OK") to the pinned model and verifies it generates tokens. Records pass/fail along with token count and elapsed time.

- **logger.mjs** - Shared logger module that re-exports `logInfo` from the central logger at `../../../lib/logger.mjs`.

- **results.mjs** - Mutable array that stores all check results with name, pass status, detail, and timestamp.

- **record.mjs** - Helper function that adds an entry to the results array and logs it with a pass/fail emoji (checkmark or cross).

- **print-summary.mjs** - Outputs a summary line showing the pass/total count (e.g., "3/3 checks passed").

### Configuration Constants

- **ollama-base.mjs** - Exports `OLLAMA_BASE` constant, defaulting to `http://localhost:11434` but configurable via `OLLAMA_API_BASE` environment variable.

- **pinned-model.mjs** - Exports `PINNED_MODEL` constant set to `"qwen2.5-coder:3b-instruct"`.

- **ping-timeout-ms.mjs** - Exports `PING_TIMEOUT_MS` constant set to `5_000` (5 seconds) for the reachability check.

- **prompt-timeout-ms.mjs** - Exports `PROMPT_TIMEOUT_MS` constant set to `60_000` (60 seconds) for the model response check.

## 3. Overall Directory Function

This directory provides a health check pipeline for the local Ollama installation. The checks run in sequence:

1. **Reachability** - Verifies Ollama API is accessible at the configured base URL
2. **Model Availability** - Confirms the pinned model is downloaded and listed
3. **Model Responsiveness** - Sends a minimal prompt to ensure the model can generate tokens

Each check records its result to the shared `results` array, and the module exits with an error code if any check fails. This ensures the harness can fail fast if the local inference environment is misconfigured or unavailable.

## 4. Usage Instructions

### Running the Audit

```bash
# Via facade (recommended)
node ops/integrations/model/ollama-local-audit.mjs
```

Or directly:

```bash
node ops/integrations/model/ollama-local-audit/runtime.mjs
```

### Configuration

Set the Ollama API base URL via environment variable:

```bash
OLLAMA_API_BASE=http://localhost:11434 node ops/integrations/model/ollama-local-audit.mjs
```

### Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

### Example Output

```
INFO: Checking qwen2.5-coder:3b-instruct at http://localhost:11434

INFO:  Ollama v0.1.20 at http://localhost:11434
INFO:  qwen2.5-coder:3b-instruct found in local model list
INFO:  Model generated 8 tokens in 1234ms
INFO: 
INFO:  3/3 checks passed
```

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Central logger module providing `createLogger` function

### External Services

- **Ollama** - Local AI inference runtime (must be running and accessible)

### Environment Variables

- **OLLAMA_API_BASE** - Optional. Override the default Ollama API base URL (`http://localhost:11434`)

## 6. Additional Comments

- **Timeout Strategy**: The module uses separate timeouts for ping (5s) and prompt (60s) since model inference is inherently slower than API version checks.

- **Fail-Fast Design**: The main orchestration stops early if Ollama is unreachable or the model is not available, avoiding unnecessary inference attempts.

- **Pinned Model**: Currently hardcoded to `qwen2.5-coder:3b-instruct`. This could be externalized to an environment variable if needed.

- **Integration Point**: This audit module is used by the Linear Guardian governance system to check Ollama health as part of the harness report validation.