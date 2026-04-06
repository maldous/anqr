# ANQR Symphony Adaptive Context

## 1. Directory Overview

This directory contains adaptive context management utilities for the ANQR (Agentic Number Query
Runner) Symphony model integrations. It provides intelligent token budget management that
dynamically adjusts context limits based on provider feedback, error patterns, and rate limit
handling. It currently contains 48 files and 0 subdirectories.

## 2. File Summaries

### Files

- **classify-error.mjs** - Main classification function that uses status code and string matching to categorize errors into ERROR_TYPES.
- **context-expand-factor.mjs** - Factor to increase context on success (1.05).
- **context-expand-threshold.mjs** - Consecutive successes needed before expanding (3).
- **context-initial-buffer.mjs** - Initial safety margin for new providers (0.8).
- **context-shrink-buffer.mjs** - Additional buffer when shrinking context (0.9).
- **context-shrink-factor.mjs** - Factor to reduce context on error (0.75).
- **create-provider-state.mjs** - Factory function that creates initial provider state with base max tokens from provider config, dynamic max tokens with safety margin, consecutive error/success counters, token/request event arrays, rate limit tracking, and error count buckets.
- **error-types.mjs** - Enum defining error types: CONTEXT_TOO_LARGE, RATE_LIMITED, AUTH_ERROR, TIMEOUT, SERVER_ERROR, UNKNOWN, TOOL_HALLUCINATION.
- **extract-error-string.mjs** - Extracts error string from various error formats (string, object, cause chain).
- **get-adaptive-stats.mjs** - Returns comprehensive stats for all providers including throttling status, TPM/RPM, error counts.
- **get-effective-max-tokens.mjs** - Returns the current dynamic max tokens for a provider.
- **get-header-value.mjs** - Gets header value from headers object (supports Map-like and plain object).
- **get-or-create-state.mjs** - Utility to get existing state or create new state for a provider on first access.
- **get-provider-adaptive-state.mjs** - Returns full state object for a specific provider.
- **get-requests-per-minute.mjs** - Calculates request count in current window for a provider.
- **get-response-headers.mjs** - Extracts response headers from error or cause chain.
- **get-status-code.mjs** - Extracts HTTP status code from error object or cause chain.
- **get-throttled-providers.mjs** - Returns list of currently throttled provider names.
- **get-tokens-per-minute.mjs** - Calculates total tokens used in current window for a provider.
- **index.mjs** - Generated facade index that exports all public API members.
- **is-auth-error.mjs** - Detects auth errors (unauthorized, invalid api key, forbidden).
- **is-context-error.mjs** - Detects context/length exceeded errors via string matching.
- **is-provider-throttled.mjs** - Checks if provider is currently throttled (throttledUntil in future).
- **is-rate-limit-error.mjs** - Detects rate limit errors (rate_limit, too many requests, quota exceeded, throttled).
- **is-server-error.mjs** - Detects server errors (internal server error, bad gateway, service unavailable, gateway timeout).
- **is-timeout-error.mjs** - Detects timeout errors (timeout, timed out, etimedout, econnaborted).
- **is-tool-hallucination-error.mjs** - Detects tool hallucination errors (unknown tool, tool not found, invalid tool).
- **logger.mjs** - Shared logger using project logger.mjs with logDebug and logInfo.
- **max-window-events.mjs** - Maximum events to retain in sliding window (512).
- **parse-context-error-details.mjs** - Parses context error message for requested tokens, reported limit, and TPM relationship.
- **parse-header-int.mjs** - Parses integer from header value.
- **parse-rate-limit-info.mjs** - Parses rate limit info from response headers (retry-after, x-ratelimit-\* headers) and error string.
- **parse-reset-header.mjs** - Parses reset timestamp from various formats (Xm, Xs, or raw seconds).
- **provider-states.mjs** - Global Map storing per-provider adaptive state. Acts as the central state container for all provider tracking.
- **prune-request-events.mjs** - Removes request events older than REQUEST_WINDOW_MS and trims to MAX_WINDOW_EVENTS.
- **prune-token-events.mjs** - Removes token events older than TOKEN_WINDOW_MS and trims to MAX_WINDOW_EVENTS.
- **rate-limit-default-backoff-ms.mjs** - Default backoff on rate limit (30,000ms).
- **rate-limit-max-backoff-ms.mjs** - Maximum backoff cap (300,000ms).
- **record-context-error.mjs** - Records context error, increments consecutive error counter, shrinks dynamic max tokens (using shrink factor or ratio-based calculation), logs the adjustment.
- **record-context-success.mjs** - Records successful context use, increments consecutive success counter, expands context after reaching expand threshold (up to base max tokens).
- **record-error-type.mjs** - Records error type count in provider state errorCounts bucket.
- **record-rate-limit.mjs** - Records rate limit event, sets throttledUntil timestamp, stores RPM/TPM limits from headers.
- **record-token-usage.mjs** - Records token usage (input/output) and request events, triggers pruning.
- **request-window-ms.mjs** - Request event window duration (60,000ms = 1 minute).
- **reset-adaptive-state.mjs** - Clears all provider states, useful for testing or state reset.
- **should-reduce-context-for-tpm.mjs** - Proactive check if estimated tokens would exceed TPM limit threshold.
- **token-window-ms.mjs** - Token event window duration (60,000ms = 1 minute).
- **tpm-proactive-threshold.mjs** - TPM threshold for proactive context reduction (0.85).

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
