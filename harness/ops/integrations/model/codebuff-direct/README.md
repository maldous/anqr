# Codebuff Direct

## Purpose

Directory for operator tooling and diagnostics; immediate files include `build-prompt.mjs`, `codebuff-max-continuations.mjs`, `codebuff-max-steps.mjs`, `codebuff-model-id.mjs`, and others.

## Contents

- 27 immediate files
- 0 child directories

## Key Files

- `build-prompt.mjs` - Exports `buildPrompt`, the main helper defined in this file.
- `codebuff-max-continuations.mjs` - Exports `CODEBUFF_MAX_CONTINUATIONS`, a shared constant or state value used by sibling modules.
- `codebuff-max-steps.mjs` - Exports `CODEBUFF_MAX_STEPS`, a shared constant or state value used by sibling modules.
- `codebuff-model-id.mjs` - Exports `CODEBUFF_MODEL_ID`, a shared constant or state value used by sibling modules.
- `codebuff-noisy-tools.mjs` - Exports `CODEBUFF_NOISY_TOOLS`, a shared constant or state value used by sibling modules.
- `codebuff-timeout-ms.mjs` - Exports `CODEBUFF_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `ensure-no-sdk-error.mjs` - Exports `ensureNoSdkError`, the main helper defined in this file.
- `extract-sdk-message.mjs` - Exports `extractSdkMessage`, the main helper defined in this file.
- `extract-text-from-unknown.mjs` - Exports `extractTextFromUnknown`, the main helper defined in this file.
- `extract-text.mjs` - Exports `extractText`, the main helper defined in this file.
- `get-api-key.mjs` - Exports `getApiKey`, the main helper defined in this file.
- `get-shared-client.mjs` - Exports `getSharedClient`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `invoke-codebuff-direct-stream.mjs` - Exports `invokeCodebuffDirectStream`, the main helper defined in this file.
- `invoke-codebuff-direct.mjs` - Exports `invokeCodebuffDirect`, the main helper defined in this file.
- `is-payment-required-error.mjs` - Exports `isPaymentRequiredError`, the main helper defined in this file.
- `is-rate-limit-error.mjs` - Exports `isRateLimitError`, the main helper defined in this file.
- `is-recoverable-error.mjs` - Exports `isRecoverableError`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `make-timeout.mjs` - Exports `makeTimeout`, the main helper defined in this file.
- `normalize-cwd.mjs` - Exports `normalizeCwd`, the main helper defined in this file.
- `reset-shared-client.mjs` - Exports `resetSharedClient`, the main helper defined in this file.
- `run-client-quietly.mjs` - Exports `runClientQuietly`, the main helper defined in this file.
- `shared-client-key.mjs` - Exports `setSharedClientKey`, the main helper defined in this file.
- `shared-client.mjs` - Exports `setSharedClient`, the main helper defined in this file.
- `tool-parameter-rules.mjs` - Exports `TOOL_PARAMETER_RULES`, a shared constant or state value used by sibling modules.
- `try-mode.mjs` - Exports `tryMode`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 27 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
