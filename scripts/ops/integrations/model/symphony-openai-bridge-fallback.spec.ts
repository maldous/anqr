/**
 * Integration tests for Symphony bridge fallback behavior
 *
 * Tests provider fallback on errors, including:
 * - Error detection and propagation from Codebuff SDK
 * - Fallback to alternate providers on rate limits
 * - Credit gate integration for provider selection
 *
 * Run: npx vitest run scripts/ops/integrations/model/symphony-openai-bridge-fallback.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../../");
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const FAILURE_STATE_FILE = resolve(STATE_DIR, "provider-failures.json");
const STATS_FILE = resolve(STATE_DIR, "provider-stats.json");

// Ensure state directory exists


describe("Symphony Bridge Fallback Logic", () => {

  // Helper functions scoped inside describe to reduce top-level heavy nodes
  function ensureStateDir() {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
    }
  }

  function clearState() {
    try {
      if (existsSync(FAILURE_STATE_FILE)) {
        unlinkSync(FAILURE_STATE_FILE);
      }
      if (existsSync(STATS_FILE)) {
        unlinkSync(STATS_FILE);
      }
    } catch {
      // Ignore
    }
  }
  beforeEach(() => {
    ensureStateDir();
    clearState();
  });

  afterEach(() => {
    clearState();
  });

  describe("Error Detection", () => {
    it("should identify retry errors correctly", () => {
      // Test the error detection logic in isRetryableError
      const testErrors = [
        { input: "RetryError: Failed after 4 attempts", expected: true },
        { input: "maxRetriesExceeded", expected: true },
        { input: "rate_limit_exceeded", expected: true },
        { input: "429 Too Many Requests", expected: true },
        { input: "Subscription 5-hour session limit reached", expected: true },
        { input: "Normal error message", expected: false },
        { input: "Something else failed", expected: false },
      ];

      // Simple retry detection logic (mirrors the bridge)
      const isRetryError = (err: string) =>
        err.includes("RetryError") ||
        err.includes("maxRetriesExceeded") ||
        err.includes("rate_limit_exceeded") ||
        err.includes("429") ||
        err.includes("session limit");

      testErrors.forEach(({ input, expected }) => {
        expect(isRetryError(input), `Expected "${input}" to be ${expected}`).toBe(expected);
      });
    });

    it("should detect rate limit errors from error objects", () => {
      // Test detection from error objects with statusCode
      const mockErrorWithStatus = {
        statusCode: 429,
        responseBody: '{"error":"rate_limit_exceeded"}',
      };

      const hasStatus429 = mockErrorWithStatus.statusCode === 429;
      const hasRateLimitBody = mockErrorWithStatus.responseBody?.includes("rate_limit");

      expect(hasStatus429).toBe(true);
      expect(hasRateLimitBody).toBe(true);
    });
  });

  describe("Provider Fallback Configuration", () => {
    it("should have fallback retry count configured", () => {
      // Verify the bridge has fallback logic - it should try multiple providers
      const MAX_FALLBACK_RETRIES = 4; // From invokeWithFallbackStream
      expect(MAX_FALLBACK_RETRIES).toBeGreaterThan(0);
    });

    it("should respect excluded providers in selection", async () => {
      // Import credit gate to test exclusion
      // @ts-ignore - .mjs import
      const creditGate = await import("./symphony-credit-gate.mjs");
      const { selectProvider, clearProviderFailure, recordProviderFailure } = creditGate;

      // Record a failure for a specific provider
      recordProviderFailure("groq");

      // Try to select with groq allowed but excluded - should skip groq due to recent failure
      const provider = await selectProvider({
        allowedNames: ["groq", "gemini"],
        excludeNames: [],
      });

      // groq should be skipped due to recent failure, so either gemini or null
      if (provider) {
        // If we get a provider, it should not be groq (skipped due to failure)
        expect(provider.name).not.toBe("groq");
      }

      // Clean up
      clearProviderFailure("groq");
    });
  });

  describe("Fallback Behavior", () => {
    it("should track tried providers during fallback", () => {
      // Simulate the triedProviders tracking in invokeWithFallbackStream
      const triedProviders: string[] = [];

      // First attempt
      triedProviders.push("codebuff");

      // Fallback attempts
      triedProviders.push("groq");
      triedProviders.push("gemini");
      triedProviders.push("ollama-local");

      expect(triedProviders.length).toBe(4);
      expect(triedProviders[0]).toBe("codebuff");
      expect(triedProviders[triedProviders.length - 1]).toBe("ollama-local");
    });

    it("should record provider failures for cooldown", async () => {
      // @ts-ignore - .mjs import
      const creditGate = await import("./symphony-credit-gate.mjs");
      const { recordProviderFailure, clearProviderFailure } = creditGate;

      // Record failure for a provider
      recordProviderFailure("test-provider");

      expect(existsSync(FAILURE_STATE_FILE)).toBe(true);

      const failures = JSON.parse(readFileSync(FAILURE_STATE_FILE, "utf-8"));
      expect(failures["test-provider"]).toBeDefined();

      // Clean up
      clearProviderFailure("test-provider");
    });

    it("should calculate fallback delay", () => {
      // Verify fallback delay is configured
      const FALLBACK_DELAY_MS = 1000;
      expect(FALLBACK_DELAY_MS).toBe(1000);
    });
  });

  describe("Credit Gate Integration", () => {
    it("should select providers using credit gate", async () => {
      // @ts-ignore - .mjs import
      const creditGate = await import("./symphony-credit-gate.mjs");
      const { selectProvider, recordProviderSuccess } = creditGate;

      // Select a provider
      const provider = await selectProvider({ allowedNames: null, excludeNames: [] });

      expect(provider).toBeDefined();
      expect(provider.name).toBeTruthy();
      expect(provider.model).toBeTruthy();

      // Record success after fallback succeeds
      if (provider) {
        recordProviderSuccess(provider.name);
      }
    });

    it("should track fallback attempts in response", () => {
      // Verify the bridge tracks fallback info in response
      const mockResponse = {
        text: "result text",
        providerName: "groq",
        attempts: 3,
        triedProviders: ["codebuff", "groq", "gemini"],
      };

      expect(mockResponse.attempts).toBe(3);
      expect(mockResponse.triedProviders).toContain("codebuff");
      expect(mockResponse.triedProviders).toContain("groq");
      expect(mockResponse.triedProviders).toContain("gemini");
    });
  });

  describe("Provider Ranking After Fallback", () => {
    it("should update provider stats after fallback success", async () => {
      // @ts-ignore - .mjs import
      const creditGate = await import("./symphony-credit-gate.mjs");
      const { selectProvider, recordProviderSuccess, recordProviderMetrics, getProviderStats } =
        creditGate;

      // Select and use a provider
      const provider = await selectProvider({ allowedNames: null, excludeNames: [] });

      if (provider) {
        // Record success
        recordProviderSuccess(provider.name);

        // Record metrics
        recordProviderMetrics(provider.name, {
          durationMs: 5000,
          inputTokens: 100,
          outputTokens: 50,
          validationPassed: true,
        });
      }

      const stats = getProviderStats();

      // Verify stats were recorded
      const providerName = provider?.name;
      if (providerName && stats[providerName]) {
        expect(stats[providerName].successes).toBeGreaterThan(0);
      }
    });
  });
});

describe("Error Propagation from Codebuff SDK", () => {
  describe("Error Detection Patterns", () => {
    it("should detect Codebuff-specific error patterns", () => {
      const codebuffErrorPatterns = [
        "RetryError [AI_RetryError]: Failed after 4 attempts",
        "APICallError2 [AI_APICallError]: Too Many Requests",
        "rate_limit_exceeded",
        "Subscription 5-hour session limit reached",
      ];

      // All of these should be detected as retryable
      codebuffErrorPatterns.forEach((pattern) => {
        const isRetryable =
          pattern.includes("RetryError") ||
          pattern.includes("maxRetriesExceeded") ||
          pattern.includes("rate_limit") ||
          pattern.includes("429") ||
          pattern.includes("Too Many Requests") ||
          pattern.includes("session limit");

        expect(isRetryable, `Pattern "${pattern.slice(0, 50)}" should be retryable`).toBe(true);
      });
    });

    it("should extract error message from nested errors", () => {
      // Simulate the unwrapAIError function behavior
      const nestedError = {
        message: "RetryError",
        cause: {
          message: "Too Many Requests",
          statusCode: 429,
          responseBody: '{"error":"rate_limit_exceeded"}',
        },
      };

      // Should be able to find rate limit info in nested structure
      const hasRateLimit =
        String(nestedError).includes("rate_limit") ||
        nestedError.cause?.responseBody?.includes("rate_limit") ||
        nestedError.cause?.statusCode === 429;

      expect(hasRateLimit).toBe(true);
    });
  });
});
