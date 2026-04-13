# Symphony Adaptive Context

## Purpose
Directory for operator tooling and diagnostics; immediate files include `classify-error.mjs`, `context-expand-factor.mjs`, `context-expand-threshold.mjs`, `context-initial-buffer.mjs`, and others.

## Contents
- 48 immediate files
- 0 child directories

## Key Files
- `classify-error.mjs` - Exports `classifyError`, the main helper defined in this file.
- `context-expand-factor.mjs` - Exports `CONTEXT_EXPAND_FACTOR`, a shared constant or state value used by sibling modules.
- `context-expand-threshold.mjs` - Exports `CONTEXT_EXPAND_THRESHOLD`, a shared constant or state value used by sibling modules.
- `context-initial-buffer.mjs` - Exports `CONTEXT_INITIAL_BUFFER`, a shared constant or state value used by sibling modules.
- `context-shrink-buffer.mjs` - Exports `CONTEXT_SHRINK_BUFFER`, a shared constant or state value used by sibling modules.
- `context-shrink-factor.mjs` - Exports `CONTEXT_SHRINK_FACTOR`, a shared constant or state value used by sibling modules.
- `create-provider-state.mjs` - Exports `createProviderState`, the main helper defined in this file.
- `error-types.mjs` - Exports `ERROR_TYPES`, a shared constant or state value used by sibling modules.
- `extract-error-string.mjs` - Exports `extractErrorString`, the main helper defined in this file.
- `get-adaptive-stats.mjs` - Exports `getAdaptiveStats`, the main helper defined in this file.
- `get-effective-max-tokens.mjs` - Exports `getEffectiveMaxTokens`, the main helper defined in this file.
- `get-header-value.mjs` - Exports `getHeaderValue`, the main helper defined in this file.
- `get-or-create-state.mjs` - Exports `getOrCreateState`, the main helper defined in this file.
- `get-provider-adaptive-state.mjs` - Exports `getProviderAdaptiveState`, the main helper defined in this file.
- `get-requests-per-minute.mjs` - Exports `getRequestsPerMinute`, the main helper defined in this file.
- `get-response-headers.mjs` - Exports `getResponseHeaders`, the main helper defined in this file.
- `get-status-code.mjs` - Exports `getStatusCode`, the main helper defined in this file.
- `get-throttled-providers.mjs` - Exports `getThrottledProviders`, the main helper defined in this file.
- `get-tokens-per-minute.mjs` - Exports `getTokensPerMinute`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-auth-error.mjs` - Exports `isAuthError`, the main helper defined in this file.
- `is-context-error.mjs` - Exports `isContextError`, the main helper defined in this file.
- `is-provider-throttled.mjs` - Exports `isProviderThrottled`, the main helper defined in this file.
- `is-rate-limit-error.mjs` - Exports `isRateLimitError`, the main helper defined in this file.
- `is-server-error.mjs` - Exports `isServerError`, the main helper defined in this file.
- `is-timeout-error.mjs` - Exports `isTimeoutError`, the main helper defined in this file.
- `is-tool-hallucination-error.mjs` - Exports `isToolHallucinationError`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `max-window-events.mjs` - Exports `MAX_WINDOW_EVENTS`, a shared constant or state value used by sibling modules.
- `parse-context-error-details.mjs` - Exports `parseContextErrorDetails`, the main helper defined in this file.
- `parse-header-int.mjs` - Exports `parseHeaderInt`, the main helper defined in this file.
- `parse-rate-limit-info.mjs` - Exports `parseRateLimitInfo`, the main helper defined in this file.
- `parse-reset-header.mjs` - Exports `parseResetHeader`, the main helper defined in this file.
- `provider-states.mjs` - Exports `providerStates`, a shared constant or state value used by sibling modules.
- `prune-request-events.mjs` - Exports `pruneRequestEvents`, the main helper defined in this file.
- `prune-token-events.mjs` - Exports `pruneTokenEvents`, the main helper defined in this file.
- `rate-limit-default-backoff-ms.mjs` - Exports `RATE_LIMIT_DEFAULT_BACKOFF_MS`, a shared constant or state value used by sibling modules.
- `rate-limit-max-backoff-ms.mjs` - Exports `RATE_LIMIT_MAX_BACKOFF_MS`, a shared constant or state value used by sibling modules.
- `record-context-error.mjs` - Exports `recordContextError`, the main helper defined in this file.
- `record-context-success.mjs` - Exports `recordContextSuccess`, the main helper defined in this file.
- `record-error-type.mjs` - Exports `recordErrorType`, the main helper defined in this file.
- `record-rate-limit.mjs` - Exports `recordRateLimit`, the main helper defined in this file.
- `record-token-usage.mjs` - Exports `recordTokenUsage`, the main helper defined in this file.
- `request-window-ms.mjs` - Exports `REQUEST_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `reset-adaptive-state.mjs` - Exports `resetAdaptiveState`, the main helper defined in this file.
- `should-reduce-context-for-tpm.mjs` - Exports `shouldReduceContextForTPM`, the main helper defined in this file.
- `token-window-ms.mjs` - Exports `TOKEN_WINDOW_MS`, a shared constant or state value used by sibling modules.
- `tpm-proactive-threshold.mjs` - Exports `TPM_PROACTIVE_THRESHOLD`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 48 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
