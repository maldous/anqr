# ANQR Codebuff Direct

## 1. Directory Overview

This directory contains the direct Codebuff SDK integration for the ANQR (Agentic Number Query
Runner) harness. It provides a streamlined interface to the Codebuff AI coding assistant, handling
API key management, client instantiation, error recovery, and both streaming and non-streaming
invocations. The module serves as the model integration layer for direct Codebuff usage within the
broader Symphony orchestration system. It currently contains 27 files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-prompt.mjs** - Exports `buildPrompt` function that converts message array to prompt format by joining role-prefixed content.
- **codebuff-max-continuations.mjs** - Exports `CODEBUFF_MAX_CONTINUATIONS` constant from environment variable `CODEBUFF_MAX_CONTINUATIONS`, defaulting to 50 continuations.
- **codebuff-max-steps.mjs** - Exports `CODEBUFF_MAX_STEPS` constant from environment variable `CODEBUFF_MAX_STEPS`, defaulting to 100 steps.
- **codebuff-model-id.mjs** - Exports `CODEBUFF_MODEL_ID` constant, defaulting to `codebuff/base` from environment variable `CODEBUFF_MODEL_ID`.
- **codebuff-noisy-tools.mjs** - Exports `CODEBUFF_NOISY_TOOLS` Set containing tool names that should be suppressed from logs to reduce noise.
- **codebuff-timeout-ms.mjs** - Exports `CODEBUFF_TIMEOUT_MS` constant for timeout duration (default 30 minutes).
- **ensure-no-sdk-error.mjs** - Exports `ensureNoSdkError` function that throws errors for SDK failures, recoverable errors, "AI_RetryError", and "Too Many Requests".
- **extract-sdk-message.mjs** - Exports `extractSdkMessage` function that extracts error messages from SDK result output by parsing JSON or matching retry error patterns.
- **extract-text-from-unknown.mjs** - Exports `extractTextFromUnknown` recursive function that extracts text from unknown value types by checking for string, array, or object and looking in common fields like "text", "content", "reasoning", "result", "message", "output".
- **extract-text.mjs** - Exports `extractText` function that wraps `extractTextFromUnknown` and joins extracted parts with newlines.
- **get-api-key.mjs** - Exports `getApiKey` function that retrieves `CODEBUFF_API_KEY` from environment variables.
- **get-shared-client.mjs** - Exports `getSharedClient` function that creates or returns the cached CodebuffClient, incorporating API key, cost mode, and normalized cwd into the cache key.
- **index.mjs** - Generated facade index that re-exports all public symbols from the various modules for convenient imports.
- **invoke-codebuff-direct-stream.mjs** - Exports `invokeCodebuffDirectStream` function that invokes Codebuff with streaming callback, falling back to free mode on recoverable errors.
- **invoke-codebuff-direct.mjs** - Exports `invokeCodebuffDirect` function that invokes Codebuff in non-streaming mode, falling back to free mode on recoverable errors.
- **is-payment-required-error.mjs** - Exports `isPaymentRequiredError` function that detects payment required errors by checking for "402", "payment required", "out of credits", "add credits", or "insufficient credits".
- **is-rate-limit-error.mjs** - Exports `isRateLimitError` function that detects rate limit errors by checking for "429", "rate_limit", "rate limit", "too many requests", "session limit", "weekly limit", "limit resets", or "continue with credits".
- **is-recoverable-error.mjs** - Exports `isRecoverableError` function that combines `isRateLimitError` and `isPaymentRequiredError` to identify recoverable errors that can be retried.
- **logger.mjs** - Creates and exports `logDebug`, `logInfo`, and `logWarn` functions from the project's logger module, scoped to this directory.
- **make-timeout.mjs** - Exports `makeTimeout` function that returns a Promise that rejects after `CODEBUFF_TIMEOUT_MS` milliseconds.
- **normalize-cwd.mjs** - Exports `normalizeCwd` function that returns the trimmed cwd or falls back to `ANQR_WORKTREE_PATH` env var or `process.cwd()`.
- **reset-shared-client.mjs** - Exports `resetSharedClient` function to clear the shared client and key (useful for testing or reinitialization).
- **run-client-quietly.mjs** - Exports `runClientQuietly` function that temporarily suppresses console.error during client execution to reduce noise.
- **shared-client-key.mjs** - Stores the cache key for the shared client via `sharedClientKey` and `setSharedClientKey` functions.
- **shared-client.mjs** - Stores the singleton CodebuffClient instance via `sharedClient` and `setSharedClient` functions.
- **tool-parameter-rules.mjs** - Exports `TOOL_PARAMETER_RULES` string documenting required JSON array formats for array-typed tool parameters. This string is injected as a knowledge file into the Codebuff client to provide runtime guidance on parameter formatting.
- **try-mode.mjs** - Core execution function `tryMode` that handles the Codebuff client run, event handling, tool tracking, timeout, auto-continuations, and Symphony result inference.

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
