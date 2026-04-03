/**
 * symphony-adaptive-context.spec.ts — Tests for the adaptive context engine.
 *
 * Covers dynamic context limits, error classification, rate-limit throttling,
 * TPM/RPM sliding-window tracking, and proactive TPM checks.
 *
 * Run: npx vitest run scripts/ops/integrations/model/symphony-adaptive-context.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  getEffectiveMaxTokens,
  recordContextError,
  recordContextSuccess,
  recordRateLimit,
  recordTokenUsage,
  recordErrorType,
  classifyError,
  isProviderThrottled,
  getThrottledProviders,
  getAdaptiveStats,
  getProviderAdaptiveState,
  parseContextErrorDetails,
  parseRateLimitInfo,
  getTokensPerMinute,
  getRequestsPerMinute,
  shouldReduceContextForTPM,
  resetAdaptiveState,
  ERROR_TYPES,
  CONTEXT_SHRINK_FACTOR,
  CONTEXT_SHRINK_BUFFER,
  CONTEXT_EXPAND_FACTOR,
  CONTEXT_EXPAND_THRESHOLD,
  CONTEXT_INITIAL_BUFFER,
  RATE_LIMIT_DEFAULT_BACKOFF_MS,
  RATE_LIMIT_MAX_BACKOFF_MS,
  TPM_PROACTIVE_THRESHOLD,
  TOKEN_WINDOW_MS,
} from "./symphony-adaptive-context.mjs";

import {
  PROVIDER_MAX_INPUT_TOKENS,
  DEFAULT_MAX_INPUT_TOKENS,
  MIN_MESSAGE_BUDGET_TOKENS,
} from "./symphony-bridge-truncation.mjs";

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetAdaptiveState();
  vi.restoreAllMocks();
});

afterEach(() => {
  resetAdaptiveState();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Constants validation
// ---------------------------------------------------------------------------

describe("adaptive context constants", () => {
  it("has reasonable shrink factor (0 < factor < 1)", () => {
    expect(CONTEXT_SHRINK_FACTOR).toBeGreaterThan(0);
    expect(CONTEXT_SHRINK_FACTOR).toBeLessThan(1);
  });

  it("has reasonable expand factor (> 1)", () => {
    expect(CONTEXT_EXPAND_FACTOR).toBeGreaterThan(1);
    expect(CONTEXT_EXPAND_FACTOR).toBeLessThanOrEqual(1.2);
  });

  it("requires multiple successes before expanding", () => {
    expect(CONTEXT_EXPAND_THRESHOLD).toBeGreaterThanOrEqual(2);
  });

  it("has all required error types", () => {
    expect(ERROR_TYPES.CONTEXT_TOO_LARGE).toBe("context_too_large");
    expect(ERROR_TYPES.RATE_LIMITED).toBe("rate_limited");
    expect(ERROR_TYPES.AUTH_ERROR).toBe("auth_error");
    expect(ERROR_TYPES.TIMEOUT).toBe("timeout");
    expect(ERROR_TYPES.SERVER_ERROR).toBe("server_error");
    expect(ERROR_TYPES.UNKNOWN).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// Dynamic context limits
// ---------------------------------------------------------------------------

describe("dynamic context limits", () => {
  it("returns buffered value (80% of base) for a known provider with no errors", () => {
    const max = getEffectiveMaxTokens("groq");
    const expected = Math.floor(PROVIDER_MAX_INPUT_TOKENS.groq * CONTEXT_INITIAL_BUFFER);
    expect(max).toBe(expected);
  });

  it("returns buffered value (80% of default) for an unknown provider", () => {
    const max = getEffectiveMaxTokens("unknown-provider-xyz");
    const expected = Math.floor(DEFAULT_MAX_INPUT_TOKENS * CONTEXT_INITIAL_BUFFER);
    expect(max).toBe(expected);
  });

  it("shrinks by CONTEXT_SHRINK_FACTOR on context error with no details", () => {
    const base = PROVIDER_MAX_INPUT_TOKENS.groq;
    const initialBuffered = Math.floor(base * CONTEXT_INITIAL_BUFFER);
    recordContextError("groq", {});
    const expected = Math.max(
      Math.floor(initialBuffered * CONTEXT_SHRINK_FACTOR),
      MIN_MESSAGE_BUDGET_TOKENS,
    );
    expect(getEffectiveMaxTokens("groq")).toBe(expected);
  });

  it("shrinks by precise ratio when requestedTokens and reportedLimit provided", () => {
    const base = PROVIDER_MAX_INPUT_TOKENS.groq; // 6000
    const initialBuffered = Math.floor(base * CONTEXT_INITIAL_BUFFER); // 4800
    recordContextError("groq", {
      requestedTokens: 13279,
      reportedLimit: 12000,
    });
    const ratio = 12000 / 13279;
    const expected = Math.max(
      Math.floor(initialBuffered * ratio * CONTEXT_SHRINK_BUFFER),
      MIN_MESSAGE_BUDGET_TOKENS,
    );
    expect(getEffectiveMaxTokens("groq")).toBe(expected);
  });

  it("never shrinks below MIN_MESSAGE_BUDGET_TOKENS", () => {
    for (let i = 0; i < 50; i++) {
      recordContextError("groq", {});
    }
    expect(getEffectiveMaxTokens("groq")).toBe(MIN_MESSAGE_BUDGET_TOKENS);
  });

  it("records TPM limit from context error when isTpmRelated", () => {
    recordContextError("groq", {
      requestedTokens: 13279,
      reportedLimit: 12000,
      isTpmRelated: true,
      tpmLimit: 12000,
    });
    const state = getProviderAdaptiveState("groq");
    expect(state.rateLimit.tpmLimit).toBe(12000);
  });

  it("expands after consecutive successes", () => {
    recordContextError("groq", {});
    const shrunkMax = getEffectiveMaxTokens("groq");
    expect(shrunkMax).toBeLessThan(
      Math.floor(PROVIDER_MAX_INPUT_TOKENS.groq * CONTEXT_INITIAL_BUFFER),
    );

    for (let i = 0; i < CONTEXT_EXPAND_THRESHOLD; i++) {
      recordContextSuccess("groq");
    }

    const expanded = getEffectiveMaxTokens("groq");
    expect(expanded).toBeGreaterThan(shrunkMax);
    expect(expanded).toBeLessThanOrEqual(PROVIDER_MAX_INPUT_TOKENS.groq);
  });

  it("never expands beyond base max tokens", () => {
    // Initial state is buffered at 80%, so we need to first expand to reach base
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < CONTEXT_EXPAND_THRESHOLD; j++) {
        recordContextSuccess("groq");
      }
    }
    expect(getEffectiveMaxTokens("groq")).toBe(PROVIDER_MAX_INPUT_TOKENS.groq);
  });

  it("resets consecutive success counter after expansion", () => {
    recordContextError("groq", {});

    for (let i = 0; i < CONTEXT_EXPAND_THRESHOLD; i++) {
      recordContextSuccess("groq");
    }
    const afterFirstExpand = getEffectiveMaxTokens("groq");

    recordContextSuccess("groq");
    expect(getEffectiveMaxTokens("groq")).toBe(afterFirstExpand);
  });

  it("shrink-then-expand converges back to base over many successes", () => {
    // Start at 80% buffer, then shrink twice, then expand
    recordContextError("groq", {});
    recordContextError("groq", {});
    const deepShrunk = getEffectiveMaxTokens("groq");
    expect(deepShrunk).toBeLessThan(
      Math.floor(PROVIDER_MAX_INPUT_TOKENS.groq * CONTEXT_INITIAL_BUFFER),
    );

    for (let cycle = 0; cycle < 50; cycle++) {
      for (let i = 0; i < CONTEXT_EXPAND_THRESHOLD; i++) {
        recordContextSuccess("groq");
      }
    }
    expect(getEffectiveMaxTokens("groq")).toBe(PROVIDER_MAX_INPUT_TOKENS.groq);
  });

  it("success resets consecutive error counter", () => {
    recordContextError("groq", {});
    recordContextSuccess("groq");
    const state = getProviderAdaptiveState("groq");
    expect(state.consecutiveContextErrors).toBe(0);
    expect(state.consecutiveContextSuccesses).toBe(1);
  });

  it("error resets consecutive success counter", () => {
    recordContextSuccess("groq");
    recordContextSuccess("groq");
    recordContextError("groq", {});
    const state = getProviderAdaptiveState("groq");
    expect(state.consecutiveContextSuccesses).toBe(0);
    expect(state.consecutiveContextErrors).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

describe("classifyError", () => {
  it("classifies 'body too large' message as CONTEXT_TOO_LARGE", () => {
    const err = new Error("Request body too large for gpt-4.1-mini model. Max size: 8000 tokens.");
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("classifies 'max size' message as CONTEXT_TOO_LARGE", () => {
    const err = new Error("Max size: 8000 tokens exceeded");
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("classifies 413 status as CONTEXT_TOO_LARGE", () => {
    const err = { statusCode: 413, message: "some error" };
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("classifies 'request too large' message as CONTEXT_TOO_LARGE", () => {
    const err = new Error("AI_APICallError: Request too large for model llama-3.3-70b-versatile");
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("classifies 'context_length_exceeded' as CONTEXT_TOO_LARGE", () => {
    const err = new Error("context_length_exceeded: maximum context length is 8192");
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("classifies 429 status as RATE_LIMITED", () => {
    const err = { statusCode: 429, message: "too many requests" };
    expect(classifyError(err)).toBe(ERROR_TYPES.RATE_LIMITED);
  });

  it("classifies 'rate_limit' message as RATE_LIMITED", () => {
    const err = new Error("rate_limit exceeded for this model");
    expect(classifyError(err)).toBe(ERROR_TYPES.RATE_LIMITED);
  });

  it("classifies 401 status as AUTH_ERROR", () => {
    const err = { statusCode: 401, message: "unauthorized" };
    expect(classifyError(err)).toBe(ERROR_TYPES.AUTH_ERROR);
  });

  it("classifies 403 status as AUTH_ERROR", () => {
    const err = { statusCode: 403, message: "forbidden" };
    expect(classifyError(err)).toBe(ERROR_TYPES.AUTH_ERROR);
  });

  it("classifies 'invalid api key' as AUTH_ERROR", () => {
    const err = new Error("Invalid API Key provided");
    expect(classifyError(err)).toBe(ERROR_TYPES.AUTH_ERROR);
  });

  it("classifies 408 status as TIMEOUT", () => {
    const err = { statusCode: 408, message: "request timeout" };
    expect(classifyError(err)).toBe(ERROR_TYPES.TIMEOUT);
  });

  it("classifies 'timed out' message as TIMEOUT", () => {
    const err = new Error("Request timed out after 30000ms");
    expect(classifyError(err)).toBe(ERROR_TYPES.TIMEOUT);
  });

  it("classifies 500 status as SERVER_ERROR", () => {
    const err = { statusCode: 500, message: "internal server error" };
    expect(classifyError(err)).toBe(ERROR_TYPES.SERVER_ERROR);
  });

  it("classifies 502 status as SERVER_ERROR", () => {
    const err = { statusCode: 502, message: "bad gateway" };
    expect(classifyError(err)).toBe(ERROR_TYPES.SERVER_ERROR);
  });

  it("classifies unknown errors as UNKNOWN", () => {
    const err = new Error("Something unexpected happened");
    expect(classifyError(err)).toBe(ERROR_TYPES.UNKNOWN);
  });

  it("handles string errors", () => {
    expect(classifyError("request too large")).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
    expect(classifyError("rate_limit")).toBe(ERROR_TYPES.RATE_LIMITED);
  });

  it("traverses error cause chain", () => {
    const inner = new Error("context_length_exceeded");
    const outer = new Error("Provider error");
    (outer as unknown as Record<string, unknown>).cause = inner;
    expect(classifyError(outer)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("checks responseBody in error chain", () => {
    const err = {
      message: "API error",
      responseBody: '{"error":{"message":"Request too large"}}',
    };
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("prioritizes CONTEXT_TOO_LARGE over RATE_LIMITED for Groq TPM errors", () => {
    const err = new Error(
      "AI_APICallError: Request too large for model llama-3.3-70b-versatile on tokens per minute (TPM): Limit 12000, Requested 13279",
    );
    (err as unknown as Record<string, unknown>).statusCode = 413;
    expect(classifyError(err)).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);
  });

  it("classifies 'unknown tool' as TOOL_HALLUCINATION", () => {
    const err = new Error("Error: Unknown tool: read");
    expect(classifyError(err)).toBe(ERROR_TYPES.TOOL_HALLUCINATION);
  });

  it("classifies 'tool not found' as TOOL_HALLUCINATION", () => {
    const err = new Error("Tool not found: hallucinated_tool");
    expect(classifyError(err)).toBe(ERROR_TYPES.TOOL_HALLUCINATION);
  });

  it("classifies 'invalid tool' as TOOL_HALLUCINATION", () => {
    const err = new Error("Invalid tool name provided");
    expect(classifyError(err)).toBe(ERROR_TYPES.TOOL_HALLUCINATION);
  });

  it("classifies 'no such tool' as TOOL_HALLUCINATION", () => {
    const err = new Error("No such tool exists in schema");
    expect(classifyError(err)).toBe(ERROR_TYPES.TOOL_HALLUCINATION);
  });

  it("classifies 'tool does not exist' as TOOL_HALLUCINATION", () => {
    const err = new Error("The requested tool does not exist");
    expect(classifyError(err)).toBe(ERROR_TYPES.TOOL_HALLUCINATION);
  });

  it("classifies 'unrecognized tool' as TOOL_HALLUCINATION", () => {
    const err = new Error("Unrecognized tool in request");
    expect(classifyError(err)).toBe(ERROR_TYPES.TOOL_HALLUCINATION);
  });
});

// ---------------------------------------------------------------------------
// Parse context error details
// ---------------------------------------------------------------------------

describe("parseContextErrorDetails", () => {
  it("parses Groq TPM error format", () => {
    const err = new Error(
      "Request too large for model llama-3.3-70b-versatile on tokens per minute (TPM): Limit 12000, Requested 13279",
    );
    const details = parseContextErrorDetails(err);
    expect(details.reportedLimit).toBe(12000);
    expect(details.requestedTokens).toBe(13279);
    expect(details.isTpmRelated).toBe(true);
    expect(details.tpmLimit).toBe(12000);
  });

  it("parses OpenAI context_length_exceeded format", () => {
    const err = new Error(
      "This model's maximum context length is 8192 tokens. However, you requested 10000 tokens",
    );
    const details = parseContextErrorDetails(err);
    expect(details.reportedLimit).toBe(8192);
    expect(details.requestedTokens).toBe(10000);
    expect(details.isTpmRelated).toBe(false);
  });

  it("extracts reportedLimit from GitHub Models 'Max size' format", () => {
    const err = new Error("Request body too large for gpt-4.1-mini model. Max size: 8000 tokens.");
    const details = parseContextErrorDetails(err);
    expect(details.reportedLimit).toBe(8000);
    expect(details.isTpmRelated).toBe(false);
  });

  it("returns nulls for errors that cannot be parsed", () => {
    const err = new Error("Unknown error occurred");
    const details = parseContextErrorDetails(err);
    expect(details.reportedLimit).toBeNull();
    expect(details.requestedTokens).toBeNull();
    expect(details.isTpmRelated).toBe(false);
    expect(details.tpmLimit).toBeNull();
  });

  it("handles string errors", () => {
    const details = parseContextErrorDetails("Limit 5000, Requested 7000");
    expect(details.reportedLimit).toBe(5000);
    expect(details.requestedTokens).toBe(7000);
  });
});

// ---------------------------------------------------------------------------
// Parse rate-limit info
// ---------------------------------------------------------------------------

describe("parseRateLimitInfo", () => {
  it("parses Retry-After header (seconds)", () => {
    const err = {
      message: "rate limited",
      responseHeaders: { "retry-after": "30" },
    };
    const info = parseRateLimitInfo(err);
    expect(info.retryAfterMs).toBe(30_000);
  });

  it("parses standard rate-limit headers", () => {
    const err = {
      message: "rate limited",
      responseHeaders: {
        "x-ratelimit-limit-requests": "30",
        "x-ratelimit-remaining-requests": "0",
        "x-ratelimit-limit-tokens": "12000",
        "x-ratelimit-remaining-tokens": "500",
      },
    };
    const info = parseRateLimitInfo(err);
    expect(info.rpmLimit).toBe(30);
    expect(info.rpmRemaining).toBe(0);
    expect(info.tpmLimit).toBe(12000);
    expect(info.tpmRemaining).toBe(500);
  });

  it("parses TPM limit from error message when headers missing", () => {
    const err = new Error("Rate limited on tokens per minute (TPM): Limit 12000");
    const info = parseRateLimitInfo(err);
    expect(info.tpmLimit).toBe(12000);
  });

  it("parses retry-after from error message", () => {
    const err = new Error("rate limited, retry-after: 60");
    const info = parseRateLimitInfo(err);
    expect(info.retryAfterMs).toBe(60_000);
  });

  it("handles Map-like headers (with .get method)", () => {
    const headers = new Map();
    headers.set("retry-after", "15");
    headers.set("x-ratelimit-limit-tokens", "8000");
    const err = { message: "rate limited", responseHeaders: headers };
    const info = parseRateLimitInfo(err);
    expect(info.retryAfterMs).toBe(15_000);
    expect(info.tpmLimit).toBe(8000);
  });

  it("traverses error cause chain for headers", () => {
    const inner = {
      message: "rate limited",
      responseHeaders: { "retry-after": "10" },
    };
    const outer = { message: "wrapper", cause: inner };
    const info = parseRateLimitInfo(outer);
    expect(info.retryAfterMs).toBe(10_000);
  });

  it("returns all nulls when nothing parseable", () => {
    const err = new Error("some unrelated error");
    const info = parseRateLimitInfo(err);
    expect(info.retryAfterMs).toBeNull();
    expect(info.rpmLimit).toBeNull();
    expect(info.tpmLimit).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Rate-limit throttling
// ---------------------------------------------------------------------------

describe("rate-limit throttling", () => {
  it("provider is not throttled by default", () => {
    expect(isProviderThrottled("groq")).toBe(false);
  });

  it("provider is throttled after recordRateLimit", () => {
    recordRateLimit("groq", { retryAfterMs: 5_000 });
    expect(isProviderThrottled("groq")).toBe(true);
  });

  it("provider is no longer throttled after backoff expires", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    recordRateLimit("groq", { retryAfterMs: 1_000 });
    expect(isProviderThrottled("groq")).toBe(true);

    vi.spyOn(Date, "now").mockReturnValue(now + 1_500);
    expect(isProviderThrottled("groq")).toBe(false);
  });

  it("uses default backoff when retryAfterMs is null", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    recordRateLimit("groq", {});
    expect(isProviderThrottled("groq")).toBe(true);

    const state = getProviderAdaptiveState("groq");
    expect(state.rateLimit.lastRetryAfterMs).toBe(RATE_LIMIT_DEFAULT_BACKOFF_MS);
  });

  it("caps backoff at RATE_LIMIT_MAX_BACKOFF_MS", () => {
    recordRateLimit("groq", { retryAfterMs: 999_999_999 });
    const state = getProviderAdaptiveState("groq");
    expect(state.rateLimit.lastRetryAfterMs).toBe(RATE_LIMIT_MAX_BACKOFF_MS);
  });

  it("getThrottledProviders returns all throttled providers", () => {
    recordRateLimit("groq", { retryAfterMs: 10_000 });
    recordRateLimit("cerebras", { retryAfterMs: 10_000 });
    const throttled = getThrottledProviders();
    expect(throttled).toContain("groq");
    expect(throttled).toContain("cerebras");
  });

  it("getThrottledProviders excludes expired throttles", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    recordRateLimit("groq", { retryAfterMs: 1_000 });
    recordRateLimit("cerebras", { retryAfterMs: 60_000 });

    vi.spyOn(Date, "now").mockReturnValue(now + 2_000);
    const throttled = getThrottledProviders();
    expect(throttled).not.toContain("groq");
    expect(throttled).toContain("cerebras");
  });

  it("stores RPM and TPM limits from rate-limit headers", () => {
    recordRateLimit("groq", {
      retryAfterMs: 5_000,
      rpmLimit: 30,
      tpmLimit: 12000,
      tpmRemaining: 0,
    });
    const state = getProviderAdaptiveState("groq");
    expect(state.rateLimit.rpmLimit).toBe(30);
    expect(state.rateLimit.tpmLimit).toBe(12000);
    expect(state.rateLimit.tpmRemaining).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Token and request tracking
// ---------------------------------------------------------------------------

describe("token and request tracking", () => {
  it("getTokensPerMinute returns 0 for untracked provider", () => {
    expect(getTokensPerMinute("groq")).toBe(0);
  });

  it("getRequestsPerMinute returns 0 for untracked provider", () => {
    expect(getRequestsPerMinute("groq")).toBe(0);
  });

  it("tracks token usage correctly", () => {
    recordTokenUsage("groq", { inputTokens: 1000, outputTokens: 500 });
    recordTokenUsage("groq", { inputTokens: 2000, outputTokens: 300 });
    expect(getTokensPerMinute("groq")).toBe(3800);
  });

  it("tracks request count correctly", () => {
    recordTokenUsage("groq", { inputTokens: 100, outputTokens: 50 });
    recordTokenUsage("groq", { inputTokens: 200, outputTokens: 100 });
    recordTokenUsage("groq", { inputTokens: 300, outputTokens: 150 });
    expect(getRequestsPerMinute("groq")).toBe(3);
  });

  it("expires old events outside the sliding window", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    recordTokenUsage("groq", { inputTokens: 5000, outputTokens: 1000 });
    expect(getTokensPerMinute("groq")).toBe(6000);

    vi.spyOn(Date, "now").mockReturnValue(now + TOKEN_WINDOW_MS + 1);
    expect(getTokensPerMinute("groq")).toBe(0);
    expect(getRequestsPerMinute("groq")).toBe(0);
  });

  it("handles missing inputTokens/outputTokens gracefully", () => {
    recordTokenUsage("groq", {});
    recordTokenUsage("groq", { inputTokens: 100 });
    recordTokenUsage("groq", { outputTokens: 200 });
    expect(getTokensPerMinute("groq")).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// Proactive TPM check
// ---------------------------------------------------------------------------

describe("shouldReduceContextForTPM", () => {
  it("returns false when no TPM limit is known", () => {
    expect(shouldReduceContextForTPM("groq", 5000)).toBe(false);
  });

  it("returns false when under threshold", () => {
    recordRateLimit("groq", { tpmLimit: 12000 });
    recordTokenUsage("groq", { inputTokens: 2000, outputTokens: 500 });
    expect(shouldReduceContextForTPM("groq", 3000)).toBe(false);
  });

  it("returns true when approaching TPM limit", () => {
    recordRateLimit("groq", { tpmLimit: 12000 });
    recordTokenUsage("groq", { inputTokens: 8000, outputTokens: 1000 });
    expect(shouldReduceContextForTPM("groq", 3000)).toBe(true);
  });

  it("uses TPM_PROACTIVE_THRESHOLD correctly", () => {
    recordRateLimit("groq", { tpmLimit: 10000 });
    const threshold = 10000 * TPM_PROACTIVE_THRESHOLD;
    recordTokenUsage("groq", { inputTokens: Math.floor(threshold) - 100, outputTokens: 0 });
    expect(shouldReduceContextForTPM("groq", 200)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Effective max tokens with TPM integration
// ---------------------------------------------------------------------------

describe("getEffectiveMaxTokens with TPM", () => {
  it("returns dynamic max (TPM reduction handled by shouldReduceContextForTPM)", () => {
    recordContextError("groq", {
      isTpmRelated: true,
      tpmLimit: 12000,
      requestedTokens: 13000,
      reportedLimit: 12000,
    });
    const effective = getEffectiveMaxTokens("groq");
    // getEffectiveMaxTokens returns the shrunk dynamic value only
    // (no TPM sliding-window reduction — that's handled by shouldReduceContextForTPM)
    expect(effective).toBeLessThan(PROVIDER_MAX_INPUT_TOKENS.groq);
    expect(effective).toBeGreaterThanOrEqual(MIN_MESSAGE_BUDGET_TOKENS);
  });

  it("does not change when token usage is recorded (TPM is separate)", () => {
    const base = getEffectiveMaxTokens("groq");
    recordTokenUsage("groq", { inputTokens: 5000, outputTokens: 1000 });
    expect(getEffectiveMaxTokens("groq")).toBe(base);
  });
});

// ---------------------------------------------------------------------------
// Error type tracking
// ---------------------------------------------------------------------------

describe("recordErrorType", () => {
  it("increments error counters correctly", () => {
    recordErrorType("groq", ERROR_TYPES.CONTEXT_TOO_LARGE);
    recordErrorType("groq", ERROR_TYPES.CONTEXT_TOO_LARGE);
    recordErrorType("groq", ERROR_TYPES.RATE_LIMITED);
    recordErrorType("groq", ERROR_TYPES.TIMEOUT);

    const state = getProviderAdaptiveState("groq");
    expect(state.errorCounts[ERROR_TYPES.CONTEXT_TOO_LARGE]).toBe(2);
    expect(state.errorCounts[ERROR_TYPES.RATE_LIMITED]).toBe(1);
    expect(state.errorCounts[ERROR_TYPES.TIMEOUT]).toBe(1);
    expect(state.errorCounts[ERROR_TYPES.AUTH_ERROR]).toBe(0);
  });

  it("counts unknown error types under UNKNOWN", () => {
    recordErrorType("groq", "nonexistent_type");
    const state = getProviderAdaptiveState("groq");
    expect(state.errorCounts[ERROR_TYPES.UNKNOWN]).toBe(1);
  });

  it("increments tool hallucination counter correctly", () => {
    recordErrorType("cerebras", ERROR_TYPES.TOOL_HALLUCINATION);
    recordErrorType("cerebras", ERROR_TYPES.TOOL_HALLUCINATION);
    recordErrorType("cerebras", ERROR_TYPES.CONTEXT_TOO_LARGE);

    const state = getProviderAdaptiveState("cerebras");
    expect(state.errorCounts[ERROR_TYPES.TOOL_HALLUCINATION]).toBe(2);
    expect(state.errorCounts[ERROR_TYPES.CONTEXT_TOO_LARGE]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Stats / observability
// ---------------------------------------------------------------------------

describe("getAdaptiveStats", () => {
  it("returns empty object when no providers tracked", () => {
    const stats = getAdaptiveStats();
    expect(Object.keys(stats)).toHaveLength(0);
  });

  it("returns stats for all tracked providers", () => {
    getEffectiveMaxTokens("groq");
    getEffectiveMaxTokens("cerebras");
    recordContextError("groq", {});

    const stats = getAdaptiveStats();
    expect(stats.groq).toBeDefined();
    expect(stats.cerebras).toBeDefined();
    // After error, dynamic is below the initial 80% buffer
    expect(stats.groq.dynamicMaxTokens).toBeLessThan(
      Math.floor(PROVIDER_MAX_INPUT_TOKENS.groq * CONTEXT_INITIAL_BUFFER),
    );
    expect(stats.groq.dynamicVsBase).not.toBe("100%");
    // cerebras starts at 80% with no errors, so dynamicVsBase = 100% (since it's at its initial buffer which equals baseMaxTokens * 0.8, but we show ratio of dynamic/base)
    expect(stats.cerebras.dynamicVsBase).toBe("80%");
  });

  it("includes error counts in stats", () => {
    recordErrorType("groq", ERROR_TYPES.CONTEXT_TOO_LARGE);
    recordErrorType("groq", ERROR_TYPES.RATE_LIMITED);

    const stats = getAdaptiveStats();
    expect(stats.groq.errorCounts[ERROR_TYPES.CONTEXT_TOO_LARGE]).toBe(1);
    expect(stats.groq.errorCounts[ERROR_TYPES.RATE_LIMITED]).toBe(1);
  });

  it("includes throttle status in stats", () => {
    recordRateLimit("groq", { retryAfterMs: 10_000 });
    const stats = getAdaptiveStats();
    expect(stats.groq.throttled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

describe("resetAdaptiveState", () => {
  it("clears all provider state", () => {
    recordContextError("groq", {});
    recordRateLimit("cerebras", { retryAfterMs: 5_000 });
    recordTokenUsage("mistral", { inputTokens: 100, outputTokens: 50 });

    resetAdaptiveState();

    expect(getAdaptiveStats()).toEqual({});
    // After reset, new providers start at 80% buffer again
    expect(getEffectiveMaxTokens("groq")).toBe(
      Math.floor(PROVIDER_MAX_INPUT_TOKENS.groq * CONTEXT_INITIAL_BUFFER),
    );
    expect(isProviderThrottled("cerebras")).toBe(false);
    expect(getTokensPerMinute("mistral")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// End-to-end scenario: Groq TPM 413 → shrink → fallback → success → expand
// ---------------------------------------------------------------------------

describe("end-to-end: Groq TPM overflow scenario", () => {
  it("reproduces and resolves the P0 Groq TPM 413 error", () => {
    const groqBase = PROVIDER_MAX_INPUT_TOKENS.groq; // 6000
    const initialBuffered = Math.floor(groqBase * CONTEXT_INITIAL_BUFFER); // 4800

    // 1. Initial state: effective max equals 80% buffer (not full base)
    expect(getEffectiveMaxTokens("groq")).toBe(initialBuffered);

    // 2. Groq returns 413 with TPM info
    const groqErr = new Error(
      "AI_APICallError: Request too large for model llama-3.3-70b-versatile on tokens per minute (TPM): Limit 12000, Requested 13279",
    );
    (groqErr as unknown as Record<string, unknown>).statusCode = 413;

    const errorType = classifyError(groqErr);
    expect(errorType).toBe(ERROR_TYPES.CONTEXT_TOO_LARGE);

    const details = parseContextErrorDetails(groqErr);
    expect(details.reportedLimit).toBe(12000);
    expect(details.requestedTokens).toBe(13279);
    expect(details.isTpmRelated).toBe(true);
    expect(details.tpmLimit).toBe(12000);

    recordErrorType("groq", errorType);
    recordContextError("groq", details);

    // 3. Dynamic limit shrunk based on ratio from initial buffered value
    const shrunkMax = getEffectiveMaxTokens("groq");
    expect(shrunkMax).toBeLessThan(initialBuffered);
    expect(shrunkMax).toBeGreaterThanOrEqual(MIN_MESSAGE_BUDGET_TOKENS);

    // 4. TPM limit recorded
    const state = getProviderAdaptiveState("groq");
    expect(state.rateLimit.tpmLimit).toBe(12000);

    // 5. Subsequent successes slowly expand back to base
    for (let cycle = 0; cycle < 20; cycle++) {
      for (let i = 0; i < CONTEXT_EXPAND_THRESHOLD; i++) {
        recordContextSuccess("groq");
      }
    }
    const recovered = getEffectiveMaxTokens("groq");
    expect(recovered).toBe(groqBase);
  });
});
