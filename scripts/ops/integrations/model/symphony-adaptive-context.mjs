#!/usr/bin/env node

/**
 * symphony-adaptive-context.mjs — Dynamic/adaptive context and rate management.
 *
 * Provides per-provider runtime state that adapts based on observed errors:
 *   - Dynamic context limits (shrink on 413, expand on consecutive successes)
 *   - TPM/RPM sliding-window tracking
 *   - Rate-limit backoff (429 → throttle timer)
 *   - Error classification (context, rate-limit, auth, timeout, server)
 *   - Proactive TPM checks to avoid hitting limits
 *
 * All state is in-memory and resets on bridge restart. The static limits in
 * symphony-bridge-truncation.mjs serve as the initial ceiling; this module
 * overrides them downward when errors are observed and slowly recovers.
 *
 * Run tests: npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
 */

import { createLogger } from "../../lib/logger.mjs";
import {
  PROVIDER_MAX_INPUT_TOKENS,
  DEFAULT_MAX_INPUT_TOKENS,
  MIN_MESSAGE_BUDGET_TOKENS,
} from "./symphony-bridge-truncation.mjs";

const { logDebug, logInfo } = createLogger();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TOKEN_WINDOW_MS = 60_000;
export const REQUEST_WINDOW_MS = 60_000;

export const CONTEXT_SHRINK_FACTOR = 0.75;
export const CONTEXT_SHRINK_BUFFER = 0.9;
export const CONTEXT_EXPAND_FACTOR = 1.05;
export const CONTEXT_EXPAND_THRESHOLD = 3;

export const RATE_LIMIT_DEFAULT_BACKOFF_MS = 30_000;
export const RATE_LIMIT_MAX_BACKOFF_MS = 300_000;
export const MAX_WINDOW_EVENTS = 512;
export const TPM_PROACTIVE_THRESHOLD = 0.85;

export const ERROR_TYPES = Object.freeze({
  CONTEXT_TOO_LARGE: "context_too_large",
  RATE_LIMITED: "rate_limited",
  AUTH_ERROR: "auth_error",
  TIMEOUT: "timeout",
  SERVER_ERROR: "server_error",
  UNKNOWN: "unknown",
  TOOL_HALLUCINATION: "tool_hallucination",
});

// ---------------------------------------------------------------------------
// Per-provider in-memory state
// ---------------------------------------------------------------------------

const providerStates = new Map();

function createProviderState(providerName) {
  const baseMaxTokens = PROVIDER_MAX_INPUT_TOKENS[providerName] || DEFAULT_MAX_INPUT_TOKENS;
  return {
    providerName,
    baseMaxTokens,
    dynamicMaxTokens: baseMaxTokens,
    consecutiveContextErrors: 0,
    consecutiveContextSuccesses: 0,
    lastContextErrorAt: null,
    lastContextSuccessAt: null,
    tokenEvents: [],
    requestEvents: [],
    rateLimit: {
      throttledUntil: null,
      lastRetryAfterMs: null,
      rpmLimit: null,
      rpmRemaining: null,
      rpmResetAt: null,
      tpmLimit: null,
      tpmRemaining: null,
      tpmResetAt: null,
    },
    errorCounts: {
      [ERROR_TYPES.CONTEXT_TOO_LARGE]: 0,
      [ERROR_TYPES.RATE_LIMITED]: 0,
      [ERROR_TYPES.AUTH_ERROR]: 0,
      [ERROR_TYPES.TIMEOUT]: 0,
      [ERROR_TYPES.SERVER_ERROR]: 0,
      [ERROR_TYPES.UNKNOWN]: 0,
      [ERROR_TYPES.TOOL_HALLUCINATION]: 0,
    },
  };
}

function getOrCreateState(providerName) {
  if (!providerStates.has(providerName)) {
    providerStates.set(providerName, createProviderState(providerName));
  }
  return providerStates.get(providerName);
}

// ---------------------------------------------------------------------------
// Sliding window helpers
// ---------------------------------------------------------------------------

function pruneTokenEvents(state) {
  const cutoff = Date.now() - TOKEN_WINDOW_MS;
  while (state.tokenEvents.length > 0 && state.tokenEvents[0].ts < cutoff) {
    state.tokenEvents.shift();
  }
  if (state.tokenEvents.length > MAX_WINDOW_EVENTS) {
    state.tokenEvents = state.tokenEvents.slice(-MAX_WINDOW_EVENTS);
  }
}

function pruneRequestEvents(state) {
  const cutoff = Date.now() - REQUEST_WINDOW_MS;
  while (state.requestEvents.length > 0 && state.requestEvents[0].ts < cutoff) {
    state.requestEvents.shift();
  }
  if (state.requestEvents.length > MAX_WINDOW_EVENTS) {
    state.requestEvents = state.requestEvents.slice(-MAX_WINDOW_EVENTS);
  }
}

// ---------------------------------------------------------------------------
// Error string extraction (lightweight — no dependency on bridge code)
// ---------------------------------------------------------------------------

function extractErrorString(err) {
  const parts = [];
  if (typeof err === "string") {
    parts.push(err);
  } else if (err && typeof err === "object") {
    if (err.message) parts.push(err.message);
    if (err.responseBody) parts.push(String(err.responseBody));
  }
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (typeof current === "string") parts.push(current);
    else if (current?.message) parts.push(current.message);
    if (current?.responseBody) parts.push(String(current.responseBody));
  }
  return parts.join(" | ").toLowerCase();
}

function getStatusCode(err) {
  if (err?.statusCode) return err.statusCode;
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (current?.statusCode) return current.statusCode;
  }
  return null;
}

function getResponseHeaders(err) {
  if (err?.responseHeaders) return err.responseHeaders;
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (current?.responseHeaders) return current.responseHeaders;
  }
  return null;
}

function getHeaderValue(headers, key) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(key);
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lowerKey) return String(v);
  }
  return null;
}

function parseHeaderInt(headers, key) {
  const val = getHeaderValue(headers, key);
  if (val === null) return null;
  const parsed = Number.parseInt(val, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseResetHeader(headers, key) {
  const val = getHeaderValue(headers, key);
  if (!val) return null;
  const secondsMatch = val.match(/(\\d+\\.?\\d*)s/);
  const minutesMatch = val.match(/(\\d+\\.?\\d*)m/);
  let ms = 0;
  if (minutesMatch) ms += Number.parseFloat(minutesMatch[1]) * 60_000;
  if (secondsMatch) ms += Number.parseFloat(secondsMatch[1]) * 1_000;
  if (ms > 0) return Date.now() + ms;
  const seconds = Number.parseFloat(val);
  if (!Number.isNaN(seconds)) return Date.now() + seconds * 1_000;
  return null;
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

function isContextError(errStr) {
  return (
    errStr.includes("request too large") ||
    errStr.includes("body too large") ||
    errStr.includes("context_length_exceeded") ||
    errStr.includes("maximum context length") ||
    errStr.includes("too many tokens") ||
    errStr.includes("token limit") ||
    errStr.includes("max_tokens") ||
    errStr.includes("max size") ||
    errStr.includes("input is too long")
  );
}

function isRateLimitError(errStr) {
  return (
    errStr.includes("rate_limit") ||
    errStr.includes("rate limit") ||
    errStr.includes("too many requests") ||
    errStr.includes("quota exceeded") ||
    errStr.includes("throttled")
  );
}

function isAuthError(errStr) {
  return (
    errStr.includes("unauthorized") ||
    errStr.includes("invalid api key") ||
    errStr.includes("invalid_api_key") ||
    errStr.includes("authentication") ||
    errStr.includes("forbidden")
  );
}

function isTimeoutError(errStr) {
  return (
    errStr.includes("timeout") ||
    errStr.includes("timed out") ||
    errStr.includes("etimedout") ||
    errStr.includes("econnaborted")
  );
}

function isServerError(errStr) {
  return (
    errStr.includes("internal server error") ||
    errStr.includes("bad gateway") ||
    errStr.includes("service unavailable") ||
    errStr.includes("gateway timeout")
  );
}

function isToolHallucinationError(errStr) {
  return (
    errStr.includes("unknown tool") ||
    errStr.includes("tool not found") ||
    errStr.includes("invalid tool") ||
    errStr.includes("no such tool") ||
    errStr.includes("tool does not exist") ||
    errStr.includes("unrecognized tool")
  );
}

export function classifyError(err) {
  const statusCode = getStatusCode(err);
  const errStr = extractErrorString(err);

  if (statusCode === 413 || isContextError(errStr)) return ERROR_TYPES.CONTEXT_TOO_LARGE;
  if (statusCode === 429 || isRateLimitError(errStr)) return ERROR_TYPES.RATE_LIMITED;
  if (statusCode === 401 || statusCode === 403 || isAuthError(errStr))
    return ERROR_TYPES.AUTH_ERROR;
  if (statusCode === 408 || isTimeoutError(errStr)) return ERROR_TYPES.TIMEOUT;
  if ((statusCode && statusCode >= 500) || isServerError(errStr)) return ERROR_TYPES.SERVER_ERROR;
  if (isToolHallucinationError(errStr)) return ERROR_TYPES.TOOL_HALLUCINATION;
  return ERROR_TYPES.UNKNOWN;
}

// ---------------------------------------------------------------------------
// Error detail parsing
// ---------------------------------------------------------------------------

export function parseContextErrorDetails(err) {
  const errStr = extractErrorString(err);

  const limitMatch = errStr.match(/limit\\s+(\\d+)/i);
  const requestedMatch = errStr.match(/requested\\s+(\\d+)/i);
  const contextLenMatch = errStr.match(/maximum context length is (\\d+)/i);
  const youRequestedMatch = errStr.match(/you requested (\\d+)/i);
  const maxSizeMatch = errStr.match(/max size[:\\s]+(\\d+)/i);
  const isTpmRelated = /tokens per minute|tpm/i.test(errStr);

  let reportedLimit = null;
  if (limitMatch) {
    reportedLimit = Number.parseInt(limitMatch[1], 10);
  } else if (contextLenMatch) {
    reportedLimit = Number.parseInt(contextLenMatch[1], 10);
  } else if (maxSizeMatch) {
    reportedLimit = Number.parseInt(maxSizeMatch[1], 10);
  }

  let requestedTokens = null;
  if (requestedMatch) {
    requestedTokens = Number.parseInt(requestedMatch[1], 10);
  } else if (youRequestedMatch) {
    requestedTokens = Number.parseInt(youRequestedMatch[1], 10);
  }

  return {
    reportedLimit,
    requestedTokens,
    isTpmRelated,
    tpmLimit: isTpmRelated && reportedLimit ? reportedLimit : null,
  };
}

export function parseRateLimitInfo(err) {
  const info = {
    retryAfterMs: null,
    rpmLimit: null,
    rpmRemaining: null,
    rpmResetAt: null,
    tpmLimit: null,
    tpmRemaining: null,
    tpmResetAt: null,
  };

  const headers = getResponseHeaders(err);
  if (headers) {
    const retryAfter = getHeaderValue(headers, "retry-after");
    if (retryAfter) {
      const seconds = Number.parseFloat(retryAfter);
      if (!Number.isNaN(seconds)) info.retryAfterMs = Math.ceil(seconds * 1_000);
    }
    info.rpmLimit = parseHeaderInt(headers, "x-ratelimit-limit-requests");
    info.rpmRemaining = parseHeaderInt(headers, "x-ratelimit-remaining-requests");
    info.tpmLimit = parseHeaderInt(headers, "x-ratelimit-limit-tokens");
    info.tpmRemaining = parseHeaderInt(headers, "x-ratelimit-remaining-tokens");
    info.rpmResetAt = parseResetHeader(headers, "x-ratelimit-reset-requests");
    info.tpmResetAt = parseResetHeader(headers, "x-ratelimit-reset-tokens");
  }

  const errStr = extractErrorString(err);
  const tpmLimitMatch = errStr.match(/tokens per minute.*?limit\\s+(\\d+)/i);
  if (tpmLimitMatch && !info.tpmLimit) {
    info.tpmLimit = Number.parseInt(tpmLimitMatch[1], 10);
  }

  const retryMatch = errStr.match(/retry[.-]after[:\\s]+(\\d+)/i);
  if (retryMatch && !info.retryAfterMs) {
    info.retryAfterMs = Number.parseInt(retryMatch[1], 10) * 1_000;
  }

  return info;
}

// ---------------------------------------------------------------------------
// Dynamic context limit management
// ---------------------------------------------------------------------------

export function getEffectiveMaxTokens(providerName) {
  const state = getOrCreateState(providerName);
  return state.dynamicMaxTokens;
}

export function recordContextError(providerName, details) {
  const { requestedTokens, reportedLimit, isTpmRelated, tpmLimit } = details || {};
  const state = getOrCreateState(providerName);
  state.consecutiveContextErrors++;
  state.consecutiveContextSuccesses = 0;
  state.lastContextErrorAt = Date.now();

  const previousMax = state.dynamicMaxTokens;

  if (requestedTokens && reportedLimit && requestedTokens > reportedLimit) {
    const ratio = reportedLimit / requestedTokens;
    state.dynamicMaxTokens = Math.max(
      Math.floor(state.dynamicMaxTokens * ratio * CONTEXT_SHRINK_BUFFER),
      MIN_MESSAGE_BUDGET_TOKENS,
    );
  } else {
    state.dynamicMaxTokens = Math.max(
      Math.floor(state.dynamicMaxTokens * CONTEXT_SHRINK_FACTOR),
      MIN_MESSAGE_BUDGET_TOKENS,
    );
  }

  if (isTpmRelated && tpmLimit) {
    state.rateLimit.tpmLimit = tpmLimit;
  }

  logInfo(
    `📉 Adaptive context: ${providerName} shrunk ${previousMax} → ${state.dynamicMaxTokens} tokens (base: ${state.baseMaxTokens})`,
    {
      providerName,
      previousMax,
      dynamicMaxTokens: state.dynamicMaxTokens,
      baseMaxTokens: state.baseMaxTokens,
      consecutiveErrors: state.consecutiveContextErrors,
      requestedTokens: requestedTokens || null,
      reportedLimit: reportedLimit || null,
      isTpmRelated: !!isTpmRelated,
    },
  );
}

export function recordContextSuccess(providerName) {
  const state = getOrCreateState(providerName);
  state.consecutiveContextSuccesses++;
  state.consecutiveContextErrors = 0;
  state.lastContextSuccessAt = Date.now();

  if (
    state.consecutiveContextSuccesses >= CONTEXT_EXPAND_THRESHOLD &&
    state.dynamicMaxTokens < state.baseMaxTokens
  ) {
    const previousMax = state.dynamicMaxTokens;
    state.dynamicMaxTokens = Math.min(
      Math.ceil(state.dynamicMaxTokens * CONTEXT_EXPAND_FACTOR),
      state.baseMaxTokens,
    );
    state.consecutiveContextSuccesses = 0;
    if (state.dynamicMaxTokens > previousMax) {
      logDebug(
        `📈 Adaptive context: ${providerName} expanded ${previousMax} → ${state.dynamicMaxTokens} tokens (base: ${state.baseMaxTokens})`,
        {
          providerName,
          previousMax,
          dynamicMaxTokens: state.dynamicMaxTokens,
          baseMaxTokens: state.baseMaxTokens,
        },
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Rate-limit / throttle management
// ---------------------------------------------------------------------------

export function recordRateLimit(providerName, info) {
  const { retryAfterMs, rpmLimit, rpmRemaining, rpmResetAt, tpmLimit, tpmRemaining, tpmResetAt } =
    info || {};
  const state = getOrCreateState(providerName);
  const backoff = Math.min(
    retryAfterMs || RATE_LIMIT_DEFAULT_BACKOFF_MS,
    RATE_LIMIT_MAX_BACKOFF_MS,
  );
  state.rateLimit.throttledUntil = Date.now() + backoff;
  state.rateLimit.lastRetryAfterMs = backoff;

  if (rpmLimit != null) state.rateLimit.rpmLimit = rpmLimit;
  if (rpmRemaining != null) state.rateLimit.rpmRemaining = rpmRemaining;
  if (rpmResetAt != null) state.rateLimit.rpmResetAt = rpmResetAt;
  if (tpmLimit != null) state.rateLimit.tpmLimit = tpmLimit;
  if (tpmRemaining != null) state.rateLimit.tpmRemaining = tpmRemaining;
  if (tpmResetAt != null) state.rateLimit.tpmResetAt = tpmResetAt;

  logInfo(`🛑 Adaptive rate-limit: ${providerName} throttled for ${backoff}ms`, {
    providerName,
    backoffMs: backoff,
    throttledUntil: state.rateLimit.throttledUntil,
    rpmLimit: rpmLimit || null,
    tpmLimit: tpmLimit || null,
  });
}

export function isProviderThrottled(providerName) {
  if (!providerStates.has(providerName)) return false;
  const state = providerStates.get(providerName);
  if (!state.rateLimit.throttledUntil) return false;
  if (Date.now() >= state.rateLimit.throttledUntil) {
    state.rateLimit.throttledUntil = null;
    return false;
  }
  return true;
}

export function getThrottledProviders() {
  const now = Date.now();
  const throttled = [];
  for (const [name, state] of providerStates) {
    if (state.rateLimit.throttledUntil && now < state.rateLimit.throttledUntil) {
      throttled.push(name);
    }
  }
  return throttled;
}

// ---------------------------------------------------------------------------
// Token and request tracking (sliding window)
// ---------------------------------------------------------------------------

export function recordTokenUsage(providerName, usage) {
  const { inputTokens, outputTokens } = usage || {};
  const state = getOrCreateState(providerName);
  const now = Date.now();
  state.tokenEvents.push({
    ts: now,
    inputTokens: inputTokens || 0,
    outputTokens: outputTokens || 0,
  });
  state.requestEvents.push({ ts: now });
  pruneTokenEvents(state);
  pruneRequestEvents(state);
}

export function getTokensPerMinute(providerName) {
  if (!providerStates.has(providerName)) return 0;
  const state = providerStates.get(providerName);
  pruneTokenEvents(state);
  let total = 0;
  for (const evt of state.tokenEvents) {
    total += evt.inputTokens + evt.outputTokens;
  }
  return total;
}

export function getRequestsPerMinute(providerName) {
  if (!providerStates.has(providerName)) return 0;
  const state = providerStates.get(providerName);
  pruneRequestEvents(state);
  return state.requestEvents.length;
}

export function shouldReduceContextForTPM(providerName, estimatedTokens) {
  const state = getOrCreateState(providerName);
  const { tpmLimit } = state.rateLimit;
  if (!tpmLimit) return false;
  const currentTPM = getTokensPerMinute(providerName);
  return currentTPM + estimatedTokens > tpmLimit * TPM_PROACTIVE_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Error type tracking
// ---------------------------------------------------------------------------

export function recordErrorType(providerName, errorType) {
  const state = getOrCreateState(providerName);
  if (errorType in state.errorCounts) {
    state.errorCounts[errorType]++;
  } else {
    state.errorCounts[ERROR_TYPES.UNKNOWN]++;
  }
}

// ---------------------------------------------------------------------------
// Stats / observability
// ---------------------------------------------------------------------------

export function getAdaptiveStats() {
  const stats = {};
  for (const [name, state] of providerStates) {
    const isThrottled = isProviderThrottled(name);
    stats[name] = {
      baseMaxTokens: state.baseMaxTokens,
      dynamicMaxTokens: state.dynamicMaxTokens,
      dynamicVsBase:
        state.dynamicMaxTokens < state.baseMaxTokens
          ? `${Math.round((state.dynamicMaxTokens / state.baseMaxTokens) * 100)}%`
          : "100%",
      consecutiveContextErrors: state.consecutiveContextErrors,
      consecutiveContextSuccesses: state.consecutiveContextSuccesses,
      lastContextErrorAt: state.lastContextErrorAt,
      lastContextSuccessAt: state.lastContextSuccessAt,
      throttled: isThrottled,
      throttledUntil: state.rateLimit.throttledUntil,
      tpmLimit: state.rateLimit.tpmLimit,
      rpmLimit: state.rateLimit.rpmLimit,
      currentTPM: getTokensPerMinute(name),
      currentRPM: getRequestsPerMinute(name),
      errorCounts: { ...state.errorCounts },
    };
  }
  return stats;
}

export function getProviderAdaptiveState(providerName) {
  if (!providerStates.has(providerName)) return null;
  return providerStates.get(providerName);
}

// ---------------------------------------------------------------------------
// Reset (for tests)
// ---------------------------------------------------------------------------

export function resetAdaptiveState() {
  providerStates.clear();
}