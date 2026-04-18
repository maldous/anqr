/**
 * Unit tests for symphony-session-state.mjs
 *
 * Tests session-aware provider selection including:
 * - Session provider tracking and stickiness
 * - Adaptive turn limit tuning
 * - Periodic evaluation cycles
 * - Codebuff mode detection
 *
 * Run: npx vitest run harness/ops/integrations/model/symphony-session-state.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../../");

// Use the shared bridge state dir (set via env var for test isolation)
const TEST_STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony-test-session-state");
const SESSION_STATE_FILE = resolve(TEST_STATE_DIR, "session-state.json");
const ADAPTIVE_PARAMS_FILE = resolve(TEST_STATE_DIR, "adaptive-params.json");

interface AdaptiveParams {
  freeTurnLimit: {
    base: number;
    min: number;
    max: number;
    perProvider: Record<string, number>;
  };
  evalCycle: {
    requestThreshold: number;
    timeThreshold: number;
    counter: number;
  };
}

// Dynamic import for the .mjs module (ESM-compatible)
const sessionStateModule = await import("./symphony-session-state.mjs");

const {
  getSessionProvider,
  updateSessionProvider,
  clearSessionProvider,
  cleanupExpiredSessions,
  detectCodebuffMode,
  tuneAdaptiveParams,
  getProviderTurnLimit,
  shouldTriggerEvalCycle,
  getEvaluationSampleProvider,
  getAdaptiveParams,
  resetAdaptiveParams,
  setSessionMessages,
  getSessionMessages,
  verifySessionMessages,
  clearSessionMessages,
} = sessionStateModule;

describe("symphony-session-state.mjs", () => {
  beforeEach(() => {
    process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;
    // Clean up state files before each test
    try {
      if (existsSync(SESSION_STATE_FILE)) {
        unlinkSync(SESSION_STATE_FILE);
      }
      if (existsSync(ADAPTIVE_PARAMS_FILE)) {
        unlinkSync(ADAPTIVE_PARAMS_FILE);
      }
    } catch {
      // Ignore errors
    }
    resetAdaptiveParams();
  });

  afterEach(() => {
    // Clean up state files after each test
    try {
      if (existsSync(SESSION_STATE_FILE)) {
        unlinkSync(SESSION_STATE_FILE);
      }
      if (existsSync(ADAPTIVE_PARAMS_FILE)) {
        unlinkSync(ADAPTIVE_PARAMS_FILE);
      }
    } catch {
      // Ignore errors
    }
    delete process.env.ANQR_BRIDGE_STATE_DIR;
  });

  describe("Session provider tracking", () => {
    it("should return null for non-existent session", () => {
      const session = getSessionProvider("non-existent-session");
      expect(session).toBeNull();
    });

    it("should track provider for new session", () => {
      const sessionId = "test-session-1";
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });

      const session = getSessionProvider(sessionId);
      expect(session).toBeDefined();
      expect(session?.provider).toBe("groq");
      expect(session?.mode).toBe("free");
      expect(session?.tier).toBe("free-cloud");
      expect(session?.turnCount).toBe(1);
    });

    it("should increment turn count for existing session with same provider", () => {
      const sessionId = "test-session-2";

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });

      const session = getSessionProvider(sessionId);
      expect(session?.turnCount).toBe(3);
    });

    it("should reset turn count when provider changes", () => {
      const sessionId = "test-session-3";

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      updateSessionProvider(sessionId, { name: "gemini", mode: "free", tier: "free-cloud" });

      const session = getSessionProvider(sessionId);
      expect(session?.provider).toBe("gemini");
      expect(session?.turnCount).toBe(1);
    });

    it("should clear session provider but preserve messages", () => {
      const sessionId = "test-session-4";

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      clearSessionProvider(sessionId);

      const session = getSessionProvider(sessionId);
      // clearSessionProvider now preserves session with messages, just clears provider fields
      expect(session).toBeDefined();
      expect(session?.provider).toBeUndefined();
    });

    it("should handle null sessionId gracefully", () => {
      expect(() => {
        updateSessionProvider(null as any, { name: "groq", mode: "free", tier: "free-cloud" });
        getSessionProvider(null as any);
        clearSessionProvider(null as any);
      }).not.toThrow();
    });
  });

  describe("Session cleanup", () => {
    it("should not clean up recent sessions", () => {
      const sessionId = "recent-session";
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });

      const cleaned = cleanupExpiredSessions();
      expect(cleaned).toBe(0);

      const session = getSessionProvider(sessionId);
      expect(session).toBeDefined();
    });

    it("should preserve lastUsed timestamp", () => {
      const sessionId = "test-session-timestamp";
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });

      const session = getSessionProvider(sessionId);
      expect(session?.lastUsed).toBeDefined();
      expect(typeof session?.lastUsed).toBe("number");
      expect(session?.lastUsed).toBeGreaterThan(Date.now() - 1000); // Within last second
    });
  });

  describe("Codebuff mode detection", () => {
    it("should detect paid mode from header", () => {
      const response = {
        headers: { "x-codebuff-mode": "paid" },
      };
      expect(detectCodebuffMode(response)).toBe("paid");
    });

    it("should detect free mode from header", () => {
      const response = {
        headers: { "x-codebuff-mode": "free" },
      };
      expect(detectCodebuffMode(response)).toBe("free");
    });

    it("should detect free mode from error message", () => {
      const response = {
        error: "Rate limit exceeded in free mode",
      };
      expect(detectCodebuffMode(response)).toBe("free");
    });

    it("should detect paid mode from error message", () => {
      const response = {
        message: "Out of credits in paid mode",
      };
      expect(detectCodebuffMode(response)).toBe("paid");
    });

    it("should return null for ambiguous response", () => {
      const response = {
        message: "Some other error",
      };
      expect(detectCodebuffMode(response)).toBeNull();
    });

    it("should return null for empty response", () => {
      expect(detectCodebuffMode({})).toBeNull();
      expect(detectCodebuffMode(null)).toBeNull();
      expect(detectCodebuffMode(undefined)).toBeNull();
    });
  });

  describe("Adaptive turn limits", () => {
    it("should return base turn limit for unknown provider", () => {
      const limit = getProviderTurnLimit("unknown-provider");
      expect(limit).toBe(10); // Default base limit
    });

    it("should use provider-specific limit when available", () => {
      // Manually set a provider-specific limit
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      params.freeTurnLimit.perProvider["test-provider"] = 15;

      const limit = getProviderTurnLimit("test-provider");
      expect(limit).toBe(15);
    });

    it("should have min and max constraints", () => {
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      expect(params.freeTurnLimit.min).toBeDefined();
      expect(params.freeTurnLimit.max).toBeDefined();
      expect(params.freeTurnLimit.min).toBeLessThan(params.freeTurnLimit.max);
    });
  });

  describe("Adaptive parameter tuning", () => {
    it("should tune parameters based on provider stats", () => {
      const providerStats = {
        "high-success-provider": {
          tier: "free-cloud",
          selections: 20,
          successRate: "90.00",
          linearCompletionRate: "85.00",
        },
        "low-success-provider": {
          tier: "free-cloud",
          selections: 20,
          successRate: "50.00",
          linearCompletionRate: "30.00",
        },
      };

      tuneAdaptiveParams(providerStats);

      const highLimit = getProviderTurnLimit("high-success-provider");
      const lowLimit = getProviderTurnLimit("low-success-provider");

      // High-success provider should have higher or equal turn limit
      expect(highLimit).toBeGreaterThanOrEqual(lowLimit);
    });

    it("should not tune providers with insufficient data", () => {
      const providerStats = {
        "new-provider": {
          tier: "free-cloud",
          selections: 5, // Below threshold of 10
          successRate: "100.00",
        },
      };

      tuneAdaptiveParams(providerStats);

      const limit = getProviderTurnLimit("new-provider");
      expect(limit).toBe(10); // Should use base limit
    });

    it("should not tune paid or local providers", () => {
      const providerStats = {
        "paid-provider": {
          tier: "paid",
          selections: 20,
          successRate: "50.00",
        },
        "local-provider": {
          tier: "local-safety-net",
          selections: 20,
          successRate: "50.00",
        },
      };

      tuneAdaptiveParams(providerStats);

      const paidLimit = getProviderTurnLimit("paid-provider");
      const localLimit = getProviderTurnLimit("local-provider");

      // Should use base limit (not tuned)
      expect(paidLimit).toBe(10);
      expect(localLimit).toBe(10);
    });

    it("should respect min and max constraints when tuning", () => {
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      const minLimit = params.freeTurnLimit.min;
      const maxLimit = params.freeTurnLimit.max;

      const providerStats = {
        "extreme-success-provider": {
          tier: "free-cloud",
          selections: 100,
          successRate: "100.00",
          linearCompletionRate: "100.00",
        },
        "extreme-failure-provider": {
          tier: "free-cloud",
          selections: 100,
          successRate: "0.00",
          linearCompletionRate: "0.00",
        },
      };

      // Tune multiple times to push limits
      for (let i = 0; i < 10; i++) {
        tuneAdaptiveParams(providerStats);
      }

      const successLimit = getProviderTurnLimit("extreme-success-provider");
      const failureLimit = getProviderTurnLimit("extreme-failure-provider");

      expect(successLimit).toBeLessThanOrEqual(maxLimit);
      expect(failureLimit).toBeGreaterThanOrEqual(minLimit);
    });
  });

  describe("Evaluation cycle triggering", () => {
    it("should not trigger immediately after reset", () => {
      resetAdaptiveParams();
      expect(shouldTriggerEvalCycle()).toBe(false);
    });

    it("should trigger after request threshold", () => {
      resetAdaptiveParams();
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      const threshold = params.evalCycle.requestThreshold;

      // Increment counter to threshold
      for (let i = 0; i < threshold - 1; i++) {
        expect(shouldTriggerEvalCycle()).toBe(false);
      }

      // Should trigger on threshold
      expect(shouldTriggerEvalCycle()).toBe(true);
    });

    it("should reset counter after triggering", () => {
      resetAdaptiveParams();
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      const threshold = params.evalCycle.requestThreshold;

      // Trigger evaluation
      for (let i = 0; i < threshold; i++) {
        shouldTriggerEvalCycle();
      }

      // Counter should be reset, so should not trigger immediately
      expect(shouldTriggerEvalCycle()).toBe(false);
    });

    it("should have configurable request threshold", () => {
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      expect(params.evalCycle.requestThreshold).toBeDefined();
      expect(params.evalCycle.requestThreshold).toBeGreaterThan(0);
    });

    it("should have configurable time threshold", () => {
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      expect(params.evalCycle.timeThreshold).toBeDefined();
      expect(params.evalCycle.timeThreshold).toBeGreaterThan(0);
    });
  });

  describe("Evaluation sample provider selection", () => {
    it("should return null when evaluation not triggered", () => {
      resetAdaptiveParams();
      const providers = ["groq", "gemini", "mistral"];
      const stats = {};

      const sample = getEvaluationSampleProvider(providers, stats);
      expect(sample).toBeNull();
    });

    it("should select underused provider during evaluation", () => {
      resetAdaptiveParams();
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      const threshold = params.evalCycle.requestThreshold;

      // Manually set counter to threshold (don't call shouldTriggerEvalCycle which resets it)
      params.evalCycle.counter = threshold;

      const providers = ["groq", "gemini", "mistral"];
      const stats = {
        groq: { selections: 100, lastUsed: Date.now() - 1000 },
        gemini: { selections: 50, lastUsed: Date.now() - 2000 },
        mistral: { selections: 10, lastUsed: Date.now() - 10000 },
      };

      const sample = getEvaluationSampleProvider(providers, stats);
      expect(sample).toBe("mistral"); // Least used + oldest
    });

    it("should handle providers with no stats", () => {
      resetAdaptiveParams();
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      const threshold = params.evalCycle.requestThreshold;

      // Manually set counter to threshold (don't call shouldTriggerEvalCycle which resets it)
      params.evalCycle.counter = threshold;

      const providers = ["new-provider", "groq"];
      const stats = {
        groq: { selections: 100, lastUsed: Date.now() },
      };

      const sample = getEvaluationSampleProvider(providers, stats);
      expect(sample).toBe("new-provider"); // Never used
    });

    it("should handle empty provider list", () => {
      resetAdaptiveParams();
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      const threshold = params.evalCycle.requestThreshold;

      // Manually set counter to threshold (don't call shouldTriggerEvalCycle which resets it)
      params.evalCycle.counter = threshold;

      const sample = getEvaluationSampleProvider([], {});
      expect(sample).toBeUndefined();
    });
  });

  describe("Adaptive parameters persistence", () => {
    it("should persist adaptive parameters to disk", () => {
      resetAdaptiveParams();
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      params.freeTurnLimit.perProvider["test-provider"] = 20;

      tuneAdaptiveParams({}); // Trigger save

      // Load fresh params
      const loaded = getAdaptiveParams() as unknown as AdaptiveParams;
      expect(loaded.freeTurnLimit.perProvider["test-provider"]).toBe(20);
    });

    it("should load default parameters if file missing", () => {
      if (existsSync(ADAPTIVE_PARAMS_FILE)) {
        unlinkSync(ADAPTIVE_PARAMS_FILE);
      }

      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      expect(params.freeTurnLimit.base).toBe(10);
      expect(params.freeTurnLimit.min).toBe(3);
      expect(params.freeTurnLimit.max).toBe(25);
    });

    it("should reset to defaults when requested", () => {
      const params = getAdaptiveParams() as unknown as AdaptiveParams;
      params.freeTurnLimit.base = 999;

      resetAdaptiveParams();

      const reset = getAdaptiveParams() as unknown as AdaptiveParams;
      expect(reset.freeTurnLimit.base).toBe(10);
    });
  });

  describe("Server-side message storage", () => {
    it("should store messages for a session", () => {
      const sessionId = "test-session-messages";
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" },
      ];

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      setSessionMessages(sessionId, messages);

      const retrieved = getSessionMessages(sessionId);
      expect(retrieved).toBeDefined();
      expect(retrieved).toHaveLength(2);
      expect(retrieved?.[0].role).toBe("system");
      expect(retrieved?.[1].content).toBe("Hello");
    });

    it("should return deep copy of messages to prevent mutation", () => {
      const sessionId = "test-session-deep-copy";
      const messages = [{ role: "user", content: "Original" }];

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      setSessionMessages(sessionId, messages);

      const retrieved = getSessionMessages(sessionId);
      if (retrieved) {
        retrieved[0].content = "Modified";
      }

      const retrievedAgain = getSessionMessages(sessionId);
      expect(retrievedAgain?.[0].content).toBe("Original");
    });

    it("should verify matching message hashes", () => {
      const sessionId = "test-session-verify";
      const messages = [{ role: "user", content: "Test message" }];

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      setSessionMessages(sessionId, messages);

      const isValid = verifySessionMessages(sessionId, messages);
      expect(isValid).toBe(true);
    });

    it("should detect message hash mismatch", () => {
      const sessionId = "test-session-mismatch";
      const originalMessages = [{ role: "user", content: "Original" }];
      const modifiedMessages = [{ role: "user", content: "Modified" }];

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      setSessionMessages(sessionId, originalMessages);

      const isValid = verifySessionMessages(sessionId, modifiedMessages);
      expect(isValid).toBe(false);
    });

    it("should clear stored messages", () => {
      const sessionId = "test-session-clear-messages";
      const messages = [{ role: "user", content: "Test" }];

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      setSessionMessages(sessionId, messages);

      clearSessionMessages(sessionId);

      const retrieved = getSessionMessages(sessionId);
      expect(retrieved).toBeNull();
    });

    it("should preserve messages when clearing session provider", () => {
      const sessionId = "test-session-preserve";
      const messages = [{ role: "user", content: "Test" }];

      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      setSessionMessages(sessionId, messages);

      clearSessionProvider(sessionId);

      const retrieved = getSessionMessages(sessionId);
      expect(retrieved).toBeDefined();
      expect(retrieved).toHaveLength(1);
    });

    it("should return null for non-existent session messages", () => {
      const retrieved = getSessionMessages("non-existent-session");
      expect(retrieved).toBeNull();
    });

    it("should return false when verifying non-existent session", () => {
      const isValid = verifySessionMessages("non-existent-session", []);
      expect(isValid).toBe(false);
    });

    it("should handle null sessionId gracefully in message operations", () => {
      expect(() => {
        setSessionMessages(null as any, []);
        getSessionMessages(null as any);
        verifySessionMessages(null as any, []);
        clearSessionMessages(null as any);
      }).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle missing provider stats gracefully", () => {
      expect(() => {
        tuneAdaptiveParams({});
      }).not.toThrow();
    });

    it("should handle malformed provider stats", () => {
      expect(() => {
        tuneAdaptiveParams({
          "bad-provider": {
            // Missing required fields
          },
        });
      }).not.toThrow();
    });

    it("should handle concurrent session updates", () => {
      const sessionId = "concurrent-session";

      // Simulate concurrent updates
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });
      updateSessionProvider(sessionId, { name: "groq", mode: "free", tier: "free-cloud" });

      const session = getSessionProvider(sessionId);
      expect(session?.turnCount).toBeGreaterThan(0);
    });

    it("should handle very long session IDs", () => {
      const longId = "x".repeat(1000);

      expect(() => {
        updateSessionProvider(longId, { name: "groq", mode: "free", tier: "free-cloud" });
        getSessionProvider(longId);
        clearSessionProvider(longId);
      }).not.toThrow();
    });
  });
});
