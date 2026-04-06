# ANQR Symphony Adaptive Context

## 1. Directory Overview

This directory implements **ANQR Symphony Adaptive Context** within the ANQR harness. Key immediate entries include `index.mjs`, `should-reduce-context-for-tpm.mjs`, `rate-limit-max-backoff-ms.mjs`, `rate-limit-default-backoff-ms.mjs`. The current inventory is 48 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **classify-error.mjs** - Exports `classifyError`, which implements classify error.
- **context-expand-factor.mjs** - Exports `CONTEXT_EXPAND_FACTOR`, a shared constant used by sibling modules.
- **context-expand-threshold.mjs** - Exports `CONTEXT_EXPAND_THRESHOLD`, a shared constant used by sibling modules.
- **context-initial-buffer.mjs** - Exports `CONTEXT_INITIAL_BUFFER`, a shared constant used by sibling modules.
- **context-shrink-buffer.mjs** - Exports `CONTEXT_SHRINK_BUFFER`, a shared constant used by sibling modules.
- **context-shrink-factor.mjs** - Exports `CONTEXT_SHRINK_FACTOR`, a shared constant used by sibling modules.
- **create-provider-state.mjs** - Exports `createProviderState`, which creates provider state.
- **error-types.mjs** - Exports `ERROR_TYPES`, a shared constant used by sibling modules.
- **extract-error-string.mjs** - Exports `extractErrorString`, which implements extract error string.
- **get-adaptive-stats.mjs** - Exports `getAdaptiveStats`, which gets adaptive stats.
- **get-effective-max-tokens.mjs** - Exports `getEffectiveMaxTokens`, which gets effective max tokens.
- **get-header-value.mjs** - Exports `getHeaderValue`, which gets header value.
- **get-or-create-state.mjs** - Exports `getOrCreateState`, which gets or create state.
- **get-provider-adaptive-state.mjs** - Exports `getProviderAdaptiveState`, which gets provider adaptive state.
- **get-requests-per-minute.mjs** - Exports `getRequestsPerMinute`, which gets requests per minute.
- **get-response-headers.mjs** - Exports `getResponseHeaders`, which gets response headers.
- **get-status-code.mjs** - Exports `getStatusCode`, which gets status code.
- **get-throttled-providers.mjs** - Exports `getThrottledProviders`, which gets throttled providers.
- **get-tokens-per-minute.mjs** - Exports `getTokensPerMinute`, which gets tokens per minute.
- **index.mjs** - Facade module that re-exports public members from `./token-window-ms.mjs`, `./request-window-ms.mjs`, `./context-shrink-factor.mjs`, `./context-shrink-buffer.mjs`, `./context-expand-factor.mjs`, `./context-expand-threshold.mjs`, and 40 more siblings.
- **is-auth-error.mjs** - Exports `isAuthError`, which checks whether auth error.
- **is-context-error.mjs** - Exports `isContextError`, which checks whether context error.
- **is-provider-throttled.mjs** - Exports `isProviderThrottled`, which checks whether provider throttled.
- **is-rate-limit-error.mjs** - Exports `isRateLimitError`, which checks whether rate limit error.
- **is-server-error.mjs** - Exports `isServerError`, which checks whether server error.
- **is-timeout-error.mjs** - Exports `isTimeoutError`, which checks whether timeout error.
- **is-tool-hallucination-error.mjs** - Exports `isToolHallucinationError`, which checks whether tool hallucination error.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logInfo`.
- **max-window-events.mjs** - Exports `MAX_WINDOW_EVENTS`, a shared constant used by sibling modules.
- **parse-context-error-details.mjs** - Exports `parseContextErrorDetails`, which parses context error details.
- **parse-header-int.mjs** - Exports `parseHeaderInt`, which parses header int.
- **parse-rate-limit-info.mjs** - Exports `parseRateLimitInfo`, which parses rate limit info.
- **parse-reset-header.mjs** - Exports `parseResetHeader`, which parses reset header.
- **provider-states.mjs** - Exports `providerStates`, which implements provider states.
- **prune-request-events.mjs** - Exports `pruneRequestEvents`, which implements prune request events.
- **prune-token-events.mjs** - Exports `pruneTokenEvents`, which implements prune token events.
- **rate-limit-default-backoff-ms.mjs** - Exports `RATE_LIMIT_DEFAULT_BACKOFF_MS`, a shared constant used by sibling modules.
- **rate-limit-max-backoff-ms.mjs** - Exports `RATE_LIMIT_MAX_BACKOFF_MS`, a shared constant used by sibling modules.
- **record-context-error.mjs** - Exports `recordContextError`, which implements record context error.
- **record-context-success.mjs** - Exports `recordContextSuccess`, which implements record context success.
- **record-error-type.mjs** - Exports `recordErrorType`, which implements record error type.
- **record-rate-limit.mjs** - Exports `recordRateLimit`, which implements record rate limit.
- **record-token-usage.mjs** - Exports `recordTokenUsage`, which implements record token usage.
- **request-window-ms.mjs** - Exports `REQUEST_WINDOW_MS`, a shared constant used by sibling modules.
- **reset-adaptive-state.mjs** - Exports `resetAdaptiveState`, which implements reset adaptive state.
- **should-reduce-context-for-tpm.mjs** - Exports `shouldReduceContextForTPM`, which implements should reduce context for tpm.
- **token-window-ms.mjs** - Exports `TOKEN_WINDOW_MS`, a shared constant used by sibling modules.
- **tpm-proactive-threshold.mjs** - Exports `TPM_PROACTIVE_THRESHOLD`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include timer, scheduling, cooldown, or watchdog behavior, and Symphony integration.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/model/symphony-adaptive-context/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../symphony-bridge-truncation.mjs`, `./context-expand-factor.mjs`, `./context-expand-threshold.mjs`, `./context-initial-buffer.mjs`, `./context-shrink-buffer.mjs`, `./context-shrink-factor.mjs`, `./create-provider-state.mjs`, `./error-types.mjs`, `./extract-error-string.mjs`, `./get-header-value.mjs`, `./get-or-create-state.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
