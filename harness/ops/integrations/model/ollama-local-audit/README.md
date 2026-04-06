# ANQR Ollama Local Audit

## 1. Directory Overview

This directory implements **ANQR Ollama Local Audit** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 14 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **check-model-available.mjs** - Exports `checkModelAvailable`, which checks model available.
- **check-model-responds.mjs** - Exports `checkModelResponds`, which checks model responds.
- **check-reachable.mjs** - Exports `checkReachable`, which checks reachable.
- **index.mjs** - Facade module that re-exports public members from `./ollama-base.mjs`, `./pinned-model.mjs`, `./prompt-timeout-ms.mjs`, `./ping-timeout-ms.mjs`, `./results.mjs`, `./record.mjs`, and 5 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **ollama-base.mjs** - Exports `OLLAMA_BASE`, a shared constant used by sibling modules.
- **ping-timeout-ms.mjs** - Exports `PING_TIMEOUT_MS`, a shared constant used by sibling modules.
- **pinned-model.mjs** - Exports `PINNED_MODEL`, a shared constant used by sibling modules.
- **print-summary.mjs** - Exports `printSummary`, which implements print summary.
- **prompt-timeout-ms.mjs** - Exports `PROMPT_TIMEOUT_MS`, a shared constant used by sibling modules.
- **record.mjs** - Exports `record`, which implements record.
- **results.mjs** - Exports `results`, an initially empty array used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, and timer, scheduling, cooldown, or watchdog behavior. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/model/ollama-local-audit/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `./check-model-available.mjs`, `./check-model-responds.mjs`, `./check-reachable.mjs`, `./index.mjs`, `./logger.mjs`, `./ollama-base.mjs`, `./ping-timeout-ms.mjs`, `./pinned-model.mjs`, `./print-summary.mjs`, `./prompt-timeout-ms.mjs`, `./record.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
