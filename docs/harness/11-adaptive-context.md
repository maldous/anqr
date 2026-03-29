# Adaptive Context and Rate Management

This document defines the fully dynamic adaptive context system used by the Symphony Bridge to manage per-provider context limits, rate budgets, and error-driven feedback loops at runtime.

## Principle

Static context limits waste capacity and cause repeated failures. The adaptive context system observes real provider responses — errors, rate-limit headers, and successes — and continuously adjusts per-provider context ceilings and throttle timers so the bridge learns the true operational envelope of every provider at runtime.

## Module

**Source**: `scripts/ops/integrations/model/symphony-adaptive-context.mjs`

**Tests**: `scripts/ops/integrations/model/symphony-adaptive-context.spec.ts` (75 tests)

**Run tests**:

```bash
npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
```

## Architecture

The adaptive context module sits between the static truncation layer and the bridge's request/response loop:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Symphony Bridge (invokeWithAI)                │
│                                                                 │
│  1. estimateMessagesTokens(rawMessages)                         │
│  2. getEffectiveMaxTokens(providerName) → dynamic ceiling       │
│  3. shouldReduceContextForTPM() → proactive halving if needed   │
│  4. truncateMessagesForProvider(msgs, provider, {               │
│       useTools, maxTokensOverride: effectiveMax })               │
│  5. Send request to provider                                    │
│                                                                 │
│  On SUCCESS:                                                    │
│    recordContextSuccess(providerName)                           │
│    recordTokenUsage(providerName, { inputTokens, outputTokens })│
│                                                                 │
│  On ERROR:                                                      │
│    classifyError(err) → errorType                               │
│    recordErrorType(providerName, errorType)                     │
│    if CONTEXT_TOO_LARGE → parseContextErrorDetails → recordContextError │
│    if RATE_LIMITED → parseRateLimitInfo → recordRateLimit        │
│                                                                 │
│  Provider selection (buildSelectionOptions):                     │
│    getThrottledProviders() → exclude from candidate set         │
│                                                                 │
│  Observability (/v1/stats):                                     │
│    getAdaptiveStats() → per-provider adaptive state snapshot    │
└─────────────────────────────────────────────────────────────────┘
```

### State lifecycle

All adaptive state is **in-memory only** and resets on bridge restart. The static limits in `PROVIDER_MAX_INPUT_TOKENS` (defined in `symphony-bridge-truncation.mjs`) serve as the initial ceiling. The adaptive module overrides them downward when errors are observed and slowly recovers toward the base value on consecutive successes.

## Per-Provider State

Each provider gets an independent state object created on first access:

| Field                         | Type                                     | Description                                                  |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `providerName`                | `string`                                 | Provider identifier                                          |
| `baseMaxTokens`               | `number`                                 | Initial ceiling from `PROVIDER_MAX_INPUT_TOKENS` (immutable) |
| `dynamicMaxTokens`            | `number`                                 | Current effective ceiling (mutates on errors/successes)      |
| `consecutiveContextErrors`    | `number`                                 | Running count of context-too-large errors                    |
| `consecutiveContextSuccesses` | `number`                                 | Running count of successful requests (resets on error)       |
| `lastContextErrorAt`          | `number\|null`                           | Epoch ms of most recent context error                        |
| `lastContextSuccessAt`        | `number\|null`                           | Epoch ms of most recent success                              |
| `tokenEvents`                 | `Array<{ts, inputTokens, outputTokens}>` | Sliding window (60s) of token usage                          |
| `requestEvents`               | `Array<{ts}>`                            | Sliding window (60s) of request timestamps                   |
| `rateLimit.throttledUntil`    | `number\|null`                           | Epoch ms — provider excluded from selection until this time  |
| `rateLimit.lastRetryAfterMs`  | `number\|null`                           | Last backoff duration applied                                |
| `rateLimit.rpmLimit`          | `number\|null`                           | Learned RPM limit from headers                               |
| `rateLimit.rpmRemaining`      | `number\|null`                           | Last observed RPM remaining                                  |
| `rateLimit.rpmResetAt`        | `number\|null`                           | Epoch ms when RPM resets                                     |
| `rateLimit.tpmLimit`          | `number\|null`                           | Learned TPM limit from headers or error messages             |
| `rateLimit.tpmRemaining`      | `number\|null`                           | Last observed TPM remaining                                  |
| `rateLimit.tpmResetAt`        | `number\|null`                           | Epoch ms when TPM resets                                     |
| `errorCounts`                 | `Record<ErrorType, number>`              | Cumulative error counts by classification                    |

## Feedback Loops

### 1. Context limit shrink (413 / context_length_exceeded)

When a provider returns a context-too-large error:

1. `classifyError(err)` → `CONTEXT_TOO_LARGE`
2. `parseContextErrorDetails(err)` extracts `reportedLimit`, `requestedTokens`, `isTpmRelated`, `tpmLimit`
3. `recordContextError(providerName, details)` shrinks `dynamicMaxTokens`:
   - **With precise numbers** (provider reported limit and requested tokens): `dynamicMaxTokens *= (reportedLimit / requestedTokens) * 0.9` (10% safety buffer)
   - **Without precise numbers**: `dynamicMaxTokens *= 0.75` (flat 25% reduction)
   - **Floor**: Never below `MIN_MESSAGE_BUDGET_TOKENS` (1,024 tokens)
4. Next request to this provider uses the reduced ceiling via `getEffectiveMaxTokens()`

**Example**: Groq reports "Requested 13,279, Limit 12,000" → ratio = 12000/13279 = 0.904 → `dynamicMaxTokens *= 0.904 * 0.9 = 0.813` → shrinks from 6,000 to ~4,880.

### 2. Context limit expand (consecutive successes)

When a provider succeeds:

1. `recordContextSuccess(providerName)` increments `consecutiveContextSuccesses`
2. After **3 consecutive successes** (`CONTEXT_EXPAND_THRESHOLD`), if `dynamicMaxTokens < baseMaxTokens`:
   - `dynamicMaxTokens *= 1.05` (5% expansion)
   - Never exceeds `baseMaxTokens`
   - Counter resets to 0
3. Over many successes, the limit converges back to the original base value

**Example**: After shrinking Groq to 4,880 → 3 successes → 5,124 → 3 more → 5,380 → … → eventually back to 6,000.

### 3. Rate-limit throttle (429 / rate_limit)

When a provider returns a rate-limit error:

1. `classifyError(err)` → `RATE_LIMITED`
2. `parseRateLimitInfo(err)` extracts from response headers and error messages:
   - `Retry-After` header → `retryAfterMs`
   - `X-RateLimit-Limit-Requests` → `rpmLimit`
   - `X-RateLimit-Remaining-Requests` → `rpmRemaining`
   - `X-RateLimit-Limit-Tokens` → `tpmLimit`
   - `X-RateLimit-Remaining-Tokens` → `tpmRemaining`
   - `X-RateLimit-Reset-Requests` / `Reset-Tokens` → reset timestamps
   - Error message fallback: `"tokens per minute.*limit (\d+)"` → `tpmLimit`
3. `recordRateLimit(providerName, info)` sets a throttle timer:
   - Duration: parsed `retryAfterMs` or default 30 seconds
   - Maximum: 5 minutes (`RATE_LIMIT_MAX_BACKOFF_MS`)
   - Provider excluded from selection until throttle expires
4. `buildSelectionOptions()` in the bridge calls `getThrottledProviders()` and adds them to the exclude set

### 4. Proactive TPM reduction

Before sending a request, the bridge checks whether the provider is approaching its TPM limit:

1. `estimateMessagesTokens(rawMessages)` estimates input token count
2. `shouldReduceContextForTPM(providerName, estimatedTokens)` checks:
   - Does this provider have a known `tpmLimit`? (learned from headers or error messages)
   - Would `currentTPM + estimatedTokens > tpmLimit * 0.85`? (85% threshold)
3. If yes: `effectiveMax` is halved (minimum 1,000 tokens)
4. This prevents hitting the TPM wall before it happens

### 5. TPM/RPM sliding-window tracking

Every successful request records token usage:

```js
recordTokenUsage(providerName, { inputTokens, outputTokens });
```

- **Token events** and **request events** are stored in 60-second sliding windows
- Window is pruned on every access (events older than 60s are dropped)
- Maximum 512 events per window to bound memory
- Token counts are **estimated from text length** (roughly chars/4 + per-message overhead), not actual provider-reported usage. Output tokens are estimated similarly from response text length.
- `getTokensPerMinute(providerName)` → current TPM
- `getRequestsPerMinute(providerName)` → current RPM

### 6. Error classification

All errors are classified into one of six types:

| Error Type          | Detection                                                                                                                                                               | Triggers                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `context_too_large` | HTTP 413, "request too large", "body too large", "context_length_exceeded", "maximum context length", "too many tokens", "token limit", "max size", "input is too long" | Context shrink loop      |
| `rate_limited`      | HTTP 429, "rate_limit", "too many requests", "quota exceeded", "throttled"                                                                                              | Rate-limit throttle loop |
| `auth_error`        | HTTP 401/403, "unauthorized", "invalid api key", "authentication", "forbidden"                                                                                          | Error count tracking     |
| `timeout`           | HTTP 408, "timeout", "timed out", "etimedout", "econnaborted"                                                                                                           | Error count tracking     |
| `server_error`      | HTTP 5xx, "internal server error", "bad gateway", "service unavailable"                                                                                                 | Error count tracking     |
| `unknown`           | None of the above                                                                                                                                                       | Error count tracking     |

The classifier traverses the AI SDK error cause chain to find nested status codes and messages (e.g., `err.cause.cause.statusCode`).

## Constants

| Constant                        | Value   | Description                                          |
| ------------------------------- | ------- | ---------------------------------------------------- |
| `TOKEN_WINDOW_MS`               | 60,000  | Sliding window duration for TPM tracking             |
| `REQUEST_WINDOW_MS`             | 60,000  | Sliding window duration for RPM tracking             |
| `CONTEXT_SHRINK_FACTOR`         | 0.75    | Flat shrink factor when no precise numbers available |
| `CONTEXT_SHRINK_BUFFER`         | 0.9     | Safety buffer multiplied against precise ratio       |
| `CONTEXT_EXPAND_FACTOR`         | 1.05    | Expansion factor per successful cycle                |
| `CONTEXT_EXPAND_THRESHOLD`      | 3       | Consecutive successes required before expansion      |
| `RATE_LIMIT_DEFAULT_BACKOFF_MS` | 30,000  | Default throttle duration when no Retry-After        |
| `RATE_LIMIT_MAX_BACKOFF_MS`     | 300,000 | Maximum throttle duration (5 minutes)                |
| `MAX_WINDOW_EVENTS`             | 512     | Maximum events per sliding window                    |
| `TPM_PROACTIVE_THRESHOLD`       | 0.85    | TPM usage fraction that triggers proactive reduction |

## Exported Functions

### Context management

| Function                | Signature                                         | Description                                                 |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| `getEffectiveMaxTokens` | `(providerName: string) → number`                 | Returns current dynamic ceiling for the provider            |
| `recordContextError`    | `(providerName: string, details?: object) → void` | Shrinks dynamic ceiling based on error details              |
| `recordContextSuccess`  | `(providerName: string) → void`                   | Increments success counter; expands ceiling after threshold |

### Rate-limit management

| Function                | Signature                                      | Description                                        |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------- |
| `recordRateLimit`       | `(providerName: string, info?: object) → void` | Sets throttle timer and records rate-limit headers |
| `isProviderThrottled`   | `(providerName: string) → boolean`             | Checks if provider is currently throttled          |
| `getThrottledProviders` | `() → string[]`                                | Returns names of all currently throttled providers |

### Token/request tracking

| Function                    | Signature                                                   | Description                                   |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------- |
| `recordTokenUsage`          | `(providerName: string, usage: object) → void`              | Records input/output tokens in sliding window |
| `getTokensPerMinute`        | `(providerName: string) → number`                           | Current TPM from sliding window               |
| `getRequestsPerMinute`      | `(providerName: string) → number`                           | Current RPM from sliding window               |
| `shouldReduceContextForTPM` | `(providerName: string, estimatedTokens: number) → boolean` | Proactive TPM check                           |

### Error handling

| Function                   | Signature                                          | Description                                                     |
| -------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `classifyError`            | `(err: Error) → string`                            | Classifies error into one of 6 types                            |
| `parseContextErrorDetails` | `(err: Error) → object`                            | Extracts reportedLimit, requestedTokens, isTpmRelated, tpmLimit |
| `parseRateLimitInfo`       | `(err: Error) → object`                            | Extracts rate-limit headers and Retry-After from error          |
| `recordErrorType`          | `(providerName: string, errorType: string) → void` | Increments per-provider error type counter                      |

### Observability

| Function                   | Signature                               | Description                                                          |
| -------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `getAdaptiveStats`         | `() → object`                           | Full adaptive state snapshot for all providers (used by `/v1/stats`) |
| `getProviderAdaptiveState` | `(providerName: string) → object\|null` | Raw state for a single provider                                      |
| `resetAdaptiveState`       | `() → void`                             | Clears all state (test use only)                                     |

## Bridge Integration Points

The adaptive context system integrates into the Symphony Bridge (`symphony-openai-bridge.mjs`) at 8 integration points:

### 1. Import (line ~85-107)

```js
import {
  truncateMessagesForProvider,
  estimateMessagesTokens,
} from "./symphony-bridge-truncation.mjs";
import {
  getEffectiveMaxTokens,
  recordContextError,
  recordContextSuccess,
  recordRateLimit,
  recordTokenUsage,
  recordErrorType,
  classifyError,
  getThrottledProviders,
  getAdaptiveStats,
  parseContextErrorDetails,
  parseRateLimitInfo,
  shouldReduceContextForTPM,
  ERROR_TYPES,
} from "./symphony-adaptive-context.mjs";
```

### 2. Provider selection — throttled providers excluded (buildSelectionOptions)

Throttled providers are added to the exclusion set so the credit-gate never selects a provider that is currently in a rate-limit backoff:

```js
const throttled = getThrottledProviders();
// ...spread into excludeNames set
```

### 3. Pre-request — dynamic ceiling and proactive TPM (invokeWithAI)

```js
const estimatedInputTokens = estimateMessagesTokens(rawMessages);
let effectiveMax = getEffectiveMaxTokens(provider.name);
if (shouldReduceContextForTPM(provider.name, estimatedInputTokens)) {
  effectiveMax = Math.max(Math.floor(effectiveMax * 0.5), 1000);
}
const aiMessages = truncateMessagesForProvider(rawMessages, provider.name, {
  useTools,
  maxTokensOverride: effectiveMax,
});
```

### 4. Success path — record success + token usage (both streaming and non-streaming)

Both `invokeWithFallbackStream` and `invokeWithFallback` record success and token usage:

```js
recordContextSuccess(provider.name);
recordTokenUsage(provider.name, {
  inputTokens: estimateMessagesTokens(messages),
  outputTokens: Math.ceil((result.text?.length || 0) / 4),
});
```

### 5. Error path — classify, record, and trigger appropriate feedback (both catch blocks)

Both streaming and non-streaming catch blocks perform identical adaptive context classification:

```js
const errorType = classifyError(err);
recordErrorType(provider.name, errorType);
if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE) {
  const details = parseContextErrorDetails(err);
  recordContextError(provider.name, details);
} else if (errorType === ERROR_TYPES.RATE_LIMITED) {
  const rlInfo = parseRateLimitInfo(err);
  recordRateLimit(provider.name, rlInfo);
}
```

### 6. Stream error interception — fatalStreamError (invokeWithFallbackStream only)

Stream errors arriving as `part.type === "error"` events are classified in-flight. If the error is `CONTEXT_TOO_LARGE` or `RATE_LIMITED`, it is stored as `fatalStreamError` and thrown **after** the stream loop completes. This routes the error through the existing catch block (point 5) so the adaptive system records it and provider fallback activates:

```js
if (part.type === "error") {
  const errorType = classifyError(part.error);
  if (errorType === ERROR_TYPES.CONTEXT_TOO_LARGE || errorType === ERROR_TYPES.RATE_LIMITED) {
    fatalStreamError = part.error;
  }
}
// ... after stream loop:
if (fatalStreamError) throw fatalStreamError;
```

Without this interception, stream errors would bypass the adaptive system entirely — the stream "completes" with a finishReason, the success path records `recordContextSuccess()`, and the provider never learns its limit was exceeded.

### 7. Sticky session clearing on failure (both catch blocks)

When a provider fails, `clearSessionProvider(sessionId)` is called immediately in the catch block so concurrent requests on the same session don't keep trying the broken provider:

```js
clearSessionProvider(sessionId);
```

Previously the sticky was only cleared on the next `buildSelectionOptions` call when the failed provider appeared in the exclude set.

### 8. Observability — /v1/stats endpoint

```js
const adaptiveContext = getAdaptiveStats();
// included in the stats response JSON
```

## Truncation Integration

The truncation module (`symphony-bridge-truncation.mjs`) accepts a `maxTokensOverride` option that bypasses the static `PROVIDER_MAX_INPUT_TOKENS` lookup:

```js
export function truncateMessagesForProvider(messages, providerName, options = {}) {
  const baseMaxTokens =
    options.maxTokensOverride ||
    PROVIDER_MAX_INPUT_TOKENS[providerName] ||
    DEFAULT_MAX_INPUT_TOKENS;
  // ...
}
```

This is the mechanism by which adaptive context limits flow into the truncation pipeline without modifying the static map.

## Observability

### /v1/stats endpoint

The adaptive context state is exposed via the `adaptiveContext` key in the `/v1/stats` response:

```json
{
  "adaptiveContext": {
    "groq": {
      "baseMaxTokens": 6000,
      "dynamicMaxTokens": 4500,
      "dynamicVsBase": "75%",
      "consecutiveContextErrors": 1,
      "consecutiveContextSuccesses": 0,
      "lastContextErrorAt": 1774525000000,
      "lastContextSuccessAt": null,
      "throttled": false,
      "throttledUntil": null,
      "tpmLimit": 12000,
      "rpmLimit": null,
      "currentTPM": 3200,
      "currentRPM": 2,
      "errorCounts": {
        "context_too_large": 1,
        "rate_limited": 0,
        "auth_error": 0,
        "timeout": 0,
        "server_error": 0,
        "unknown": 0
      }
    }
  }
}
```

### Log messages

| Emoji | Message                                                              | Level | When                       |
| ----- | -------------------------------------------------------------------- | ----- | -------------------------- |
| 📉    | `Adaptive context: {provider} shrunk {old} → {new} tokens`           | INFO  | Context error recorded     |
| 📈    | `Adaptive context: {provider} expanded {old} → {new} tokens`         | DEBUG | Expansion after threshold  |
| 🛑    | `Adaptive rate-limit: {provider} throttled for {ms}ms`               | INFO  | Rate-limit backoff applied |
| ⚡    | `Proactive TPM reduction for {provider}: effectiveMax halved to {n}` | INFO  | TPM threshold exceeded     |

## Error message parsing

The module parses provider-specific error message formats to extract precise limits:

### Groq TPM format

```
Tokens Per Minute (TPM): Limit 12000, Requested 13279
```

Extracts: `reportedLimit=12000`, `requestedTokens=13279`, `isTpmRelated=true`, `tpmLimit=12000`

### OpenAI format

```
This model's maximum context length is 8192 tokens. You requested 10000 tokens.
```

Extracts: `reportedLimit=8192`, `requestedTokens=10000`, `isTpmRelated=false`

### GitHub Models format

```
Request body too large for gpt-4.1-mini model. Max size: 8000 tokens.
```

Extracts: `reportedLimit=8000`, `requestedTokens=null`, `isTpmRelated=false`

The `"body too large"` substring matches `isContextError()`, and the `maxSizeMatch` regex `/max size[:\s]+(\d+)/i` extracts the `reportedLimit`. Without `requestedTokens`, the system falls back to `CONTEXT_SHRINK_BUFFER` ratio shrink.

### Rate-limit headers

| Header                           | Parsed As                                           |
| -------------------------------- | --------------------------------------------------- |
| `Retry-After`                    | `retryAfterMs` (seconds → ms)                       |
| `X-RateLimit-Limit-Requests`     | `rpmLimit`                                          |
| `X-RateLimit-Remaining-Requests` | `rpmRemaining`                                      |
| `X-RateLimit-Limit-Tokens`       | `tpmLimit`                                          |
| `X-RateLimit-Remaining-Tokens`   | `tpmRemaining`                                      |
| `X-RateLimit-Reset-Requests`     | `rpmResetAt` (supports `"1m30s"` and plain seconds) |
| `X-RateLimit-Reset-Tokens`       | `tpmResetAt` (supports `"1m30s"` and plain seconds) |

Headers are read from both `Map` objects (standard `Headers`) and plain objects (some AI SDK error wrappers).

## Relationship to Other Modules

| Module                           | Relationship                                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `symphony-bridge-truncation.mjs` | Provides static `PROVIDER_MAX_INPUT_TOKENS` (base values) and `estimateMessagesTokens`; accepts `maxTokensOverride` from adaptive system |
| `symphony-credit-gate.mjs`       | Owns provider selection and failure cooldown; adaptive system adds throttle-based exclusion on top                                       |
| `symphony-openai-bridge.mjs`     | Consumes all adaptive functions at 6 integration points (see above)                                                                      |
| `symphony-session-state.mjs`     | Manages session turn limits; independent from adaptive context                                                                           |

## Design Decisions

1. **In-memory only**: State resets on bridge restart. This is intentional — providers change their limits and the bridge should rediscover them fresh. Persistence would risk stale limits.

2. **Separate from credit-gate failure tracking**: The credit-gate's `recordProviderFailure()` applies a 6-minute cooldown for any failure. The adaptive system provides finer-grained feedback — context errors shrink limits, rate-limit errors apply precise backoff timers, and successes expand limits. Both systems run in parallel.

3. **No modification of static map**: `PROVIDER_MAX_INPUT_TOKENS` is never mutated. The `maxTokensOverride` option in `truncateMessagesForProvider` provides the override path. This keeps the static map as a reliable reference.

4. **Proactive TPM check in bridge, not in getEffectiveMaxTokens**: The proactive TPM halving happens in `invokeWithAI` (bridge layer) rather than inside `getEffectiveMaxTokens()`. This avoids double-reduction when both mechanisms would fire and keeps the adaptive module focused on state management.

5. **Conservative expansion**: 5% expansion per cycle with a 3-success threshold means it takes ~15-20 successful requests to recover from a single shrink. This prevents oscillation.

_Last updated: 2026-03-27_
