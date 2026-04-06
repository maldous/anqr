# ANQR Symphony Adaptive Context

## 1. Directory Overview

This directory contains adaptive context management utilities for the ANQR (Agentic Number Query Runner) Symphony model integrations. It provides intelligent token budget management that dynamically adjusts context limits based on provider feedback, error patterns, and rate limit handling.

The module implements a feedback-driven adaptive system that shrinks context on errors and expands it on successful requests, enabling more robust LLM interactions across multiple providers with varying context window sizes and rate limits.

## 2. File Summaries

### State Management

- **provider-states.mjs** - Global Map storing per-provider adaptive state. Acts as the central state container for all provider tracking.

- **create-provider-state.mjs** - Factory function that creates initial provider state with base max tokens from provider config, dynamic max tokens with safety margin, consecutive error/success counters, token/request event arrays, rate limit tracking, and error count buckets.

- **get-or-create-state.mjs** - Utility to get existing state or create new state for a provider on first access.

- **reset-adaptive-state.mjs** - Clears all provider states, useful for testing or state reset.

### Constants and Configuration

- **token-window-ms.mjs** - Token event window duration (60,000ms = 1 minute).
- **request-window-ms.mjs** - Request event window duration (60,000ms = 1 minute).
- **max-window-events.mjs** - Maximum events to retain in sliding window (512).
- **context-shrink-factor.mjs** - Factor to reduce context on error (0.75).
- **context-expand-factor.mjs** - Factor to increase context on success (1.05).
- **context-expand-threshold.mjs** - Consecutive successes needed before expanding (3).
- **context-initial-buffer.mjs** - Initial safety margin for new providers (0.8).
- **context-shrink-buffer.mjs** - Additional buffer when shrinking context (0.9).
- **rate-limit-default-backoff-ms.mjs** - Default backoff on rate limit (30,000ms).
- **rate-limit-max-backoff-ms.mjs** - Maximum backoff cap (300,000ms).
- **tpm-proactive-threshold.mjs** - TPM threshold for proactive context reduction (0.85).

### Error Classification

- **error-types.mjs** - Enum defining error types: CONTEXT_TOO_LARGE, RATE_LIMITED, AUTH_ERROR, TIMEOUT, SERVER_ERROR, UNKNOWN, TOOL_HALLUCINATION.

- **extract-error-string.mjs** - Extracts error string from various error formats (string, object, cause chain).

- **get-status-code.mjs** - Extracts HTTP status code from error object or cause chain.

- **is-context-error.mjs** - Detects context/length exceeded errors via string matching.

- **is-rate-limit-error.mjs** - Detects rate limit errors (rate_limit, too many requests, quota exceeded, throttled).

- **is-auth-error.mjs** - Detects auth errors (unauthorized, invalid api key, forbidden).

- **is-timeout-error.mjs** - Detects timeout errors (timeout, timed out, etimedout, econnaborted).

- **is-server-error.mjs** - Detects server errors (internal server error, bad gateway, service unavailable, gateway timeout).

- **is-tool-hallucination-error.mjs** - Detects tool hallucination errors (unknown tool, tool not found, invalid tool).

- **classify-error.mjs** - Main classification function that uses status code and string matching to categorize errors into ERROR_TYPES.

### Context Event Tracking

- **prune-token-events.mjs** - Removes token events older than TOKEN_WINDOW_MS and trims to MAX_WINDOW_EVENTS.

- **prune-request-events.mjs** - Removes request events older than REQUEST_WINDOW_MS and trims to MAX_WINDOW_EVENTS.

- **record-token-usage.mjs** - Records token usage (input/output) and request events, triggers pruning.

- **get-tokens-per-minute.mjs** - Calculates total tokens used in current window for a provider.

- **get-requests-per-minute.mjs** - Calculates request count in current window for a provider.

- **get-adaptive-stats.mjs** - Returns comprehensive stats for all providers including throttling status, TPM/RPM, error counts.

### Adaptive Context Adjustment

- **record-context-error.mjs** - Records context error, increments consecutive error counter, shrinks dynamic max tokens (using shrink factor or ratio-based calculation), logs the adjustment.

- **record-context-success.mjs** - Records successful context use, increments consecutive success counter, expands context after reaching expand threshold (up to base max tokens).

- **get-effective-max-tokens.mjs** - Returns the current dynamic max tokens for a provider.

### Rate Limit Handling

- **get-header-value.mjs** - Gets header value from headers object (supports Map-like and plain object).

- **parse-header-int.mjs** - Parses integer from header value.

- **parse-reset-header.mjs** - Parses reset timestamp from various formats (Xm, Xs, or raw seconds).

- **get-response-headers.mjs** - Extracts response headers from error or cause chain.

- **parse-rate-limit-info.mjs** - Parses rate limit info from response headers (retry-after, x-ratelimit-* headers) and error string.

- **record-rate-limit.mjs** - Records rate limit event, sets throttledUntil timestamp, stores RPM/TPM limits from headers.

- **is-provider-throttled.mjs** - Checks if provider is currently throttled (throttledUntil in future).

- **get-throttled-providers.mjs** - Returns list of currently throttled provider names.

### Error Details Parsing

- **parse-context-error-details.mjs** - Parses context error message for requested tokens, reported limit, and TPM relationship.

- **should-reduce-context-for-tpm.mjs** - Proactive check if estimated tokens would exceed TPM limit threshold.

### Error Recording

- **record-error-type.mjs** - Records error type count in provider state errorCounts bucket.

### State Inspection

- **get-provider-adaptive-state.mjs** - Returns full state object for a specific provider.

### Index and Logger

- **index.mjs** - Generated facade index that exports all public API members.

- **logger.mjs** - Shared logger using project logger.mjs with logDebug and logInfo.

## 3. Overall Directory Function

This directory provides a sophisticated adaptive context management system that enables the Symphony bridge to dynamically adjust token budgets per provider based on real-time feedback:

**Feedback Loop:**
1. On context errors (413): Shrink context using CONTEXT_SHRINK_FACTOR or ratio-based calculation
2. On consecutive successes (CONTEXT_EXPAND_THRESHOLD): Gradually expand context up to base max
3. On rate limits: Throttle provider and backoff appropriately

**Key Capabilities:**
- **Dynamic token budgets** - Each provider maintains its own dynamicMaxTokens that adjusts based on errors/successes
- **Sliding window metrics** - Tracks TPM and RPM using bounded event arrays
- **Error classification** - Classifies errors to trigger appropriate responses
- **Rate limit parsing** - Extracts rate limit info from headers and error messages
- **Proactive reduction** - Can reduce context before hitting TPM limits

The system integrates with symphony-bridge-truncation.mjs for provider max token configuration and MIN_MESSAGE_BUDGET_TOKENS constant.

## 4. Usage Instructions

This module is primarily used by the Symphony bridge for adaptive provider context management:

```javascript
import {
  getEffectiveMaxTokens,
  recordContextError,
  recordContextSuccess,
  recordRateLimit,
  isProviderThrottled,
  classifyError,
  parseContextErrorDetails,
  ERROR_TYPES,
  getAdaptiveStats,
  resetAdaptiveState,
} from "./symphony-adaptive-context/index.mjs";
```

**Typical Usage Patterns:**

1. **Before making a request:**
```javascript
const maxTokens = getEffectiveMaxTokens(providerName);
if (isProviderThrottled(providerName)) {
  // Skip or wait
}
```

2. **After receiving a response:**
```javascript
recordTokenUsage(providerName, { inputTokens, outputTokens });
recordContextSuccess(providerName);
```

3. **On error:**
```javascript
const errorType = classifyError(err);
if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
  const details = parseContextErrorDetails(err);
  recordContextError(providerName, details);
} else if (errorType === ERROR_TYPES.RATE_LIMITED) {
  const info = parseRateLimitInfo(err);
  recordRateLimit(providerName, info);
}
recordErrorType(providerName, errorType);
```

4. **Debugging:**
```javascript
const stats = getAdaptiveStats();
// Shows dynamicMaxTokens, throttling status, TPM/RPM, error counts per provider
```

## 5. Dependencies

### Internal Dependencies

- **../symphony-bridge-truncation.mjs** - Provides PROVIDER_MAX_INPUT_TOKENS, DEFAULT_MAX_INPUT_TOKENS, MIN_MESSAGE_BUDGET_TOKENS
- **../../../lib/logger.mjs** - Shared logging utility

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid provider configuration in symphony-bridge-truncation.mjs

### External Services

- LLM providers (OpenAI, Anthropic, etc.) - for error responses and rate limit headers

## 6. Additional Comments

- **Safety margins** - New providers start at CONTEXT_INITIAL_BUFFER (80%) of base max to avoid immediate 413 errors
- **Fail-closed design** - The system errs on the side of smaller context to avoid errors rather than over-allocating
- **Backoff capping** - Rate limit backoff is capped at 5 minutes to prevent excessive waiting
- **State persistence** - Provider states are in-memory only; resets on process restart
- **Adaptive expansion** - Context only expands after CONTEXT_EXPAND_THRESHOLD consecutive successes to avoid oscillation
- **TPM proactive** - Can proactively reduce context before hitting TPM limits based on current window usage
- **Error bucketing** - All errors are counted in named buckets for analytics and debugging