# ANQR Codebuff Direct

## 1. Directory Overview

This directory contains the direct Codebuff SDK integration for the ANQR (Agentic Number Query Runner) harness. It provides a streamlined interface to the Codebuff AI coding assistant, handling API key management, client instantiation, error recovery, and both streaming and non-streaming invocations. The module serves as the model integration layer for direct Codebuff usage within the broader Symphony orchestration system.

## 2. File Summaries

### Configuration Constants

- **codebuff-model-id.mjs** - Exports `CODEBUFF_MODEL_ID` constant, defaulting to `codebuff/base` from environment variable `CODEBUFF_MODEL_ID`.
- **codebuff-max-steps.mjs** - Exports `CODEBUFF_MAX_STEPS` constant from environment variable `CODEBUFF_MAX_STEPS`, defaulting to 100 steps.
- **codebuff-max-continuations.mjs** - Exports `CODEBUFF_MAX_CONTINUATIONS` constant from environment variable `CODEBUFF_MAX_CONTINUATIONS`, defaulting to 50 continuations.
- **codebuff-timeout-ms.mjs** - Exports `CODEBUFF_TIMEOUT_MS` constant for timeout duration (default 30 minutes).
- **tool-parameter-rules.mjs** - Exports `TOOL_PARAMETER_RULES` string documenting required JSON array formats for array-typed tool parameters. This string is injected as a knowledge file into the Codebuff client to provide runtime guidance on parameter formatting.
- **codebuff-noisy-tools.mjs** - Exports `CODEBUFF_NOISY_TOOLS` Set containing tool names that should be suppressed from logs to reduce noise.

### Client Management

- **shared-client.mjs** - Stores the singleton CodebuffClient instance via `sharedClient` and `setSharedClient` functions.
- **shared-client-key.mjs** - Stores the cache key for the shared client via `sharedClientKey` and `setSharedClientKey` functions.
- **get-shared-client.mjs** - Exports `getSharedClient` function that creates or returns the cached CodebuffClient, incorporating API key, cost mode, and normalized cwd into the cache key.
- **reset-shared-client.mjs** - Exports `resetSharedClient` function to clear the shared client and key (useful for testing or reinitialization).

### Utilities

- **logger.mjs** - Creates and exports `logDebug`, `logInfo`, and `logWarn` functions from the project's logger module, scoped to this directory.
- **normalize-cwd.mjs** - Exports `normalizeCwd` function that returns the trimmed cwd or falls back to `ANQR_WORKTREE_PATH` env var or `process.cwd()`.
- **get-api-key.mjs** - Exports `getApiKey` function that retrieves `CODEBUFF_API_KEY` from environment variables.
- **make-timeout.mjs** - Exports `makeTimeout` function that returns a Promise that rejects after `CODEBUFF_TIMEOUT_MS` milliseconds.

### Error Handling

- **is-rate-limit-error.mjs** - Exports `isRateLimitError` function that detects rate limit errors by checking for "429", "rate_limit", "rate limit", "too many requests", "session limit", "weekly limit", "limit resets", or "continue with credits".
- **is-payment-required-error.mjs** - Exports `isPaymentRequiredError` function that detects payment required errors by checking for "402", "payment required", "out of credits", "add credits", or "insufficient credits".
- **is-recoverable-error.mjs** - Exports `isRecoverableError` function that combines `isRateLimitError` and `isPaymentRequiredError` to identify recoverable errors that can be retried.
- **ensure-no-sdk-error.mjs** - Exports `ensureNoSdkError` function that throws errors for SDK failures, recoverable errors, "AI_RetryError", and "Too Many Requests".

### Text Extraction

- **extract-text-from-unknown.mjs** - Exports `extractTextFromUnknown` recursive function that extracts text from unknown value types by checking for string, array, or object and looking in common fields like "text", "content", "reasoning", "result", "message", "output".
- **extract-sdk-message.mjs** - Exports `extractSdkMessage` function that extracts error messages from SDK result output by parsing JSON or matching retry error patterns.
- **extract-text.mjs** - Exports `extractText` function that wraps `extractTextFromUnknown` and joins extracted parts with newlines.

### Invocation

- **build-prompt.mjs** - Exports `buildPrompt` function that converts message array to prompt format by joining role-prefixed content.
- **run-client-quietly.mjs** - Exports `runClientQuietly` function that temporarily suppresses console.error during client execution to reduce noise.
- **invoke-codebuff-direct.mjs** - Exports `invokeCodebuffDirect` function that invokes Codebuff in non-streaming mode, falling back to free mode on recoverable errors.
- **invoke-codebuff-direct-stream.mjs** - Exports `invokeCodebuffDirectStream` function that invokes Codebuff with streaming callback, falling back to free mode on recoverable errors.
- **try-mode.mjs** - Core execution function `tryMode` that handles the Codebuff client run, event handling, tool tracking, timeout, auto-continuations, and Symphony result inference.

### Index

- **index.mjs** - Generated facade index that re-exports all public symbols from the various modules for convenient imports.

## 3. Overall Directory Function

This directory provides a complete integration layer for direct Codebuff SDK usage within the ANQR harness. The files work together to enable robust AI-assisted code execution:

The flow begins with `invokeCodebuffDirect` or `invokeCodebuffDirectStream`, which retrieves the API key via `getApiKey`, normalizes the working directory via `normalizeCwd`, and builds a prompt via `buildPrompt`. It then calls `tryMode` which obtains or creates a shared client via `getSharedClient`, executes the client with `runClientQuietly` to suppress noisy output, handles events for tool calls and errors, and implements auto-continuations when subgoals remain in progress.

Error recovery is handled through `isRecoverableError` which detects rate limits and payment errors, triggering a fallback to free mode. Text extraction utilities parse SDK output in various formats, while configuration constants allow fine-tuning through environment variables.

The module integrates with the broader Symphony system via `inferSymphonyResultFromCompletion` from `bridge-result.mjs`, converting Codebuff execution results into Symphony-compatible format with completion status, failure classification, mutation tracking, and tool call counts.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. The recommended import pattern is through the index facade:

```javascript
import {
  invokeCodebuffDirect,
  invokeCodebuffDirectStream,
  CODEBUFF_MAX_STEPS,
  CODEBUFF_TIMEOUT_MS,
  getApiKey,
} from "./ops/integrations/model/codebuff-direct/index.mjs";
```

### Direct Execution

To invoke Codebuff directly (non-streaming):

```javascript
const result = await invokeCodebuffDirect({
  messages: [{ role: "user", content: "Write a function to sort an array" }],
  cwd: "/path/to/project",
});
console.log(result.text);
```

To invoke with streaming:

```javascript
await invokeCodebuffDirectStream({
  messages: [{ role: "user", content: "Write a function to sort an array" }],
  cwd: "/path/to/project",
  onTextChunk: (chunk) => process.stdout.write(chunk),
});
```

### Environment Variables

Required:
- `CODEBUFF_API_KEY` - API key for Codebuff service

Optional:
- `CODEBUFF_MODEL_ID` - Model to use (default: "codebuff/base")
- `CODEBUFF_MAX_STEPS` - Maximum steps per run (default: 100)
- `CODEBUFF_MAX_CONTINUATIONS` - Maximum auto-continuations (default: 50)
- `CODEBUFF_TIMEOUT_MS` - Timeout in milliseconds (default: 1800000 = 30 min)
- `ANQR_WORKTREE_PATH` - Fallback cwd if not provided

### Error Handling

The module automatically handles recoverable errors (rate limits, payment required) by falling back to free mode. For non-recoverable errors, exceptions are propagated with extracted error messages.

## 5. Dependencies

### Internal Dependencies

- **../../../core/bridge-result.mjs** - For `inferSymphonyResultFromCompletion` function
- **../../../lib/logger.mjs** - For logger factory
- **@codebuff/sdk** - Official Codebuff SDK for Node.js

### External Services

- **Codebuff API** - AI coding assistant service requiring valid API key

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Codebuff API key in environment
- Network access to Codebuff API endpoints

## 6. Additional Comments

- **Client Caching**: The shared client is cached based on API key, cost mode, and cwd to avoid recreating clients for repeated invocations. Call `resetSharedClient()` to clear the cache.

- **Auto-Continuation**: The module automatically continues execution when subgoals remain "IN_PROGRESS" up to `CODEBUFF_MAX_CONTINUATIONS` times, enabling longer-running tasks.

- **Noisy Tool Suppression**: Common high-frequency tools like `read_files`, `spawn_agents`, and `file-picker` are suppressed from debug logs to reduce noise.

- **Failover Strategy**: On recoverable errors (rate limit, payment required), the module automatically retries with free mode as a fallback, providing resilience against temporary service constraints.

- **Timeout Protection**: All invocations are protected by `CODEBUFF_TIMEOUT_MS` to prevent hung operations from blocking the harness indefinitely.

- **Symphony Integration**: Results are translated into Symphony-compatible format using `inferSymphonyResultFromCompletion`, enabling consistent result handling across the orchestration layer.