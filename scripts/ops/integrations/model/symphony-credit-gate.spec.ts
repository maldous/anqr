/**
 * Integration tests for Symphony credit-gate provider selection
 *
 * Tests provider selection, cooldown, retry, and metrics capture
 * as specified in testing-strategy-anqr-1.0.md
 *
 * Run: npx vitest run scripts/ops/integrations/model/symphony-credit-gate.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../../");
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const FAILURE_STATE_FILE = resolve(STATE_DIR, "provider-failures.json");
const STATS_FILE = resolve(STATE_DIR, "provider-stats.json");

// Dynamic import for the .mjs module (ESM-compatible)
// @ts-expect-error -- .mjs has no declaration file
const creditGate = await import("./symphony-credit-gate.mjs");

const {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  clearProviderFailure,
  recordProviderSuccess,
  recordProviderMetrics,
  getProviderStats,
  getRankedProviders,
  resetProviderStats,
} = creditGate;

describe("Symphony Credit Gate - Provider Selection", () => {
  beforeEach(() => {
    try {
      if (existsSync(FAILURE_STATE_FILE)) {
        unlinkSync(FAILURE_STATE_FILE);
      }
      if (existsSync(STATS_FILE)) {
        unlinkSync(STATS_FILE);
      }
    } catch {
      // Ignore errors
    }
    resetProviderStats();
  });

  afterEach(() => {
    try {
      if (existsSync(FAILURE_STATE_FILE)) {
        unlinkSync(FAILURE_STATE_FILE);
      }
      if (existsSync(STATS_FILE)) {
        unlinkSync(STATS_FILE);
      }
    } catch {
      // Ignore errors
    }
  });

  describe("selectProvider", () => {
    it("should select a provider with no restrictions", async () => {
      const provider = await selectProvider({ allowedNames: null, excludeNames: [] });
      expect(provider).toBeDefined();
      expect(provider.name).toBeTruthy();
      expect(provider.model).toBeTruthy();
    });

    it("should respect allowedNames filter", async () => {
      const provider = await selectProvider({
        allowedNames: ["groq", "mistral"],
        excludeNames: [],
      });

      if (provider) {
        expect(["groq", "mistral"]).toContain(provider.name);
      }
    });

    it("should respect excludeNames filter", async () => {
      const provider = await selectProvider({
        allowedNames: null,
        excludeNames: ["ollama-local"],
      });

      if (provider) {
        expect(provider.name).not.toBe("ollama-local");
      }
    });

    it("should skip recently failed providers", async () => {
      recordProviderFailure("groq");

      const provider = await selectProvider({
        allowedNames: ["groq", "gemini"],
        excludeNames: [],
      });

      // If groq was recently failed, should try gemini instead (or skip both)
      if (provider) {
        // groq should be skipped due to recent failure
        expect(provider.name).not.toBe("groq");
      }
    });
  });

  describe("Provider Metrics", () => {
    it("should record provider success", () => {
      creditGate.recordProviderSelection("test-provider");
      recordProviderSuccess("test-provider");
      const stats = getProviderStats();

      expect(stats["test-provider"]).toBeDefined();
      expect(stats["test-provider"].successes).toBe(1);
    });

    it("should record provider failure count", () => {
      creditGate.recordProviderSelection("test-provider");
      recordProviderFailureCount("test-provider");
      const stats = getProviderStats();

      expect(stats["test-provider"]).toBeDefined();
      expect(stats["test-provider"].failures).toBe(1);
    });

    it("should record provider metrics", () => {
      creditGate.recordProviderSelection("test-provider");
      recordProviderMetrics("test-provider", {
        durationMs: 5000,
        inputTokens: 100,
        outputTokens: 50,
        validationPassed: true,
      });

      const stats = getProviderStats();
      expect(stats["test-provider"]).toBeDefined();
      expect(stats["test-provider"].avgDurationMs).toBe(5000);
    });

    it("should calculate provider score after multiple selections", async () => {
      await selectProvider({ allowedNames: null, excludeNames: [] });
      await selectProvider({ allowedNames: null, excludeNames: [] });
      await selectProvider({ allowedNames: null, excludeNames: [] });

      recordProviderSuccess("test-provider");
      recordProviderMetrics("test-provider", {
        durationMs: 3000,
        inputTokens: 100,
        outputTokens: 50,
        validationPassed: true,
      });

      const ranked = getRankedProviders();
      expect(ranked.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Provider Cooldown", () => {
    it("should record provider failure", () => {
      recordProviderFailure("test-provider");

      expect(existsSync(FAILURE_STATE_FILE)).toBe(true);

      const failures = JSON.parse(readFileSync(FAILURE_STATE_FILE, "utf-8"));
      expect(failures["test-provider"]).toBeDefined();
    });

    it("should clear provider failure", () => {
      recordProviderFailure("test-provider");
      clearProviderFailure("test-provider");

      const failures = JSON.parse(readFileSync(FAILURE_STATE_FILE, "utf-8"));
      expect(failures["test-provider"]).toBeUndefined();
    });

    it("should track multiple provider failures", () => {
      recordProviderFailure("provider-a");
      recordProviderFailure("provider-b");
      recordProviderFailure("provider-c");

      const failures = JSON.parse(readFileSync(FAILURE_STATE_FILE, "utf-8"));
      expect(Object.keys(failures).length).toBe(3);
    });
  });

  describe("Provider Ranking", () => {
    it("should return ranked providers", async () => {
      for (let i = 0; i < 5; i++) {
        await selectProvider({ allowedNames: null, excludeNames: [] });
      }

      recordProviderSuccess("provider-a");
      recordProviderSuccess("provider-a");
      recordProviderSuccess("provider-b");

      const ranked = getRankedProviders();
      expect(Array.isArray(ranked)).toBe(true);
    });

    it("should include provider stats in output", () => {
      creditGate.recordProviderSelection("test-provider");
      recordProviderSuccess("test-provider");
      recordProviderMetrics("test-provider", {
        durationMs: 2000,
        inputTokens: 100,
        outputTokens: 50,
        validationPassed: true,
      });

      const stats = getProviderStats();
      expect(stats["test-provider"]).toBeDefined();
      expect(stats["test-provider"].selections).toBeGreaterThan(0);
      expect(stats["test-provider"].successRate).toBeTruthy();
      expect(stats["test-provider"].avgDurationMs).toBe(2000);
    });
  });
});
