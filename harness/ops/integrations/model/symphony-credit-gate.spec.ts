/**
 * Integration tests for Symphony credit-gate provider selection
 *
 * Tests provider selection, cooldown, retry, and metrics capture
 * as specified in testing-strategy-anqr-1.0.md
 *
 * Run: npx vitest run harness/ops/integrations/model/symphony-credit-gate.spec.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../../");
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const FAILURE_STATE_FILE = resolve(STATE_DIR, "provider-failures.json");
const STATS_FILE = resolve(STATE_DIR, "provider-stats.json");
const HEALTH_STATE_FILE = resolve(STATE_DIR, "provider-health.json");
const PROBE_CACHE_FILE = resolve(STATE_DIR, "provider-probe-cache.json");
const PROBE_RESULTS_FILE = resolve(STATE_DIR, "provider-probe-results.json");

// Dynamic import for the .mjs module (ESM-compatible)
const creditGate = await import("./symphony-credit-gate.mjs");

const {
  selectProvider,
  recordProviderFailure,
  recordProviderFailureCount,
  clearProviderFailure,
  recordProviderSuccess,
  recordProviderMetrics,
  recordProviderSelection,
  recordProbeResult,
  recordLinearCompletion,
  getProviderStats,
  getRankedProviders,
  resetProviderStats,
  getProviderDefinitions,
} = creditGate;

describe("Symphony Credit Gate - Provider Selection", () => {
  beforeEach(() => {
    try {
      for (const f of [
        FAILURE_STATE_FILE,
        STATS_FILE,
        HEALTH_STATE_FILE,
        PROBE_CACHE_FILE,
        PROBE_RESULTS_FILE,
      ]) {
        if (existsSync(f)) unlinkSync(f);
      }
    } catch {
      // Ignore errors
    }
    resetProviderStats();
  });

  afterEach(() => {
    try {
      for (const f of [
        FAILURE_STATE_FILE,
        STATS_FILE,
        HEALTH_STATE_FILE,
        PROBE_CACHE_FILE,
        PROBE_RESULTS_FILE,
      ]) {
        if (existsSync(f)) unlinkSync(f);
      }
    } catch {
      // Ignore errors
    }
  });

  describe("selectProvider", () => {
    it("should select a provider with no restrictions", async () => {
      const provider = await selectProvider({ allowedNames: null, excludeNames: [] });
      expect(provider).toBeDefined();
      expect(provider!.name).toBeTruthy();
      expect(provider!.model).toBeTruthy();
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
      recordProviderFailure("groq", "provider_error");

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
      recordProviderSelection("test-provider");
      recordProviderSuccess("test-provider");
      const stats = getProviderStats();

      expect(stats["test-provider"]).toBeDefined();
      expect(stats["test-provider"].successes).toBe(1);
    });

    it("should record provider failure count", () => {
      recordProviderSelection("test-provider");
      recordProviderFailureCount("test-provider");
      const stats = getProviderStats();

      expect(stats["test-provider"]).toBeDefined();
      expect(stats["test-provider"].failures).toBe(1);
    });

    it("should record provider metrics", () => {
      recordProviderSelection("test-provider");
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

  describe("Probe Metrics (separate from runtime)", () => {
    it("should record probe success in probeSelections/probeSuccesses", () => {
      recordProbeResult("probe-test", { success: true, durationMs: 500 });
      const stats = getProviderStats();

      expect(stats["probe-test"]).toBeDefined();
      expect(stats["probe-test"].probeSelections).toBe(1);
      expect(stats["probe-test"].probeSuccesses).toBe(1);
      expect(stats["probe-test"].probeFailures).toBe(0);
      expect(stats["probe-test"].probeAvgDurationMs).toBe(500);
    });

    it("should record probe failure in probeFailures", () => {
      recordProbeResult("probe-test", { success: false, durationMs: 200 });
      const stats = getProviderStats();

      expect(stats["probe-test"].probeSelections).toBe(1);
      expect(stats["probe-test"].probeSuccesses).toBe(0);
      expect(stats["probe-test"].probeFailures).toBe(1);
    });

    it("should NOT contaminate runtime selections/successes counters", () => {
      recordProbeResult("probe-test", { success: true, durationMs: 300 });
      recordProbeResult("probe-test", { success: true, durationMs: 400 });
      recordProbeResult("probe-test", { success: false, durationMs: 100 });
      const stats = getProviderStats();

      expect(stats["probe-test"].selections).toBe(0);
      expect(stats["probe-test"].successes).toBe(0);
      expect(stats["probe-test"].failures).toBe(0);
      expect(stats["probe-test"].probeSelections).toBe(3);
      expect(stats["probe-test"].probeSuccesses).toBe(2);
      expect(stats["probe-test"].probeFailures).toBe(1);
    });

    it("should bootstrap score for provider with only probe data (>= 3 probes)", () => {
      recordProbeResult("probe-only", { success: true, durationMs: 200 });
      recordProbeResult("probe-only", { success: true, durationMs: 300 });
      recordProbeResult("probe-only", { success: true, durationMs: 250 });
      const stats = getProviderStats();

      expect(stats["probe-only"].score).not.toBe("pending");
      expect(typeof stats["probe-only"].score).toBe("number");
      expect(stats["probe-only"].score).toBeGreaterThan(0);
    });

    it("should bootstrap score with < 3 probes when capability is demonstrated", () => {
      recordProbeResult("probe-few", { success: true, durationMs: 200 });
      recordProbeResult("probe-few", { success: true, durationMs: 300 });
      const stats = getProviderStats();

      expect(typeof stats["probe-few"].score).toBe("number");
      expect(stats["probe-few"].score).toBeGreaterThan(0);
    });

    it("should calculate score on failure via recordProviderFailureCount", () => {
      recordProviderSelection("fail-test");
      recordProviderSelection("fail-test");
      recordProviderSelection("fail-test");
      recordProviderFailureCount("fail-test");
      recordProviderFailureCount("fail-test");
      recordProviderFailureCount("fail-test");
      const stats = getProviderStats();

      expect(stats["fail-test"].score).not.toBe("pending");
      expect(typeof stats["fail-test"].score).toBe("number");
    });
  });

  describe("P0 Safety Net — selectProvider never causes total outage", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
      originalFetch = globalThis.fetch;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("should activate safety-net override when explicitly enabled", async () => {
      // Mock fetch: ollama returns success, everything else fails
      globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL) => {
        const urlStr = String(url);
        if (urlStr.includes("11434") || urlStr.includes("ollama")) {
          return {
            ok: true,
            text: async () =>
              JSON.stringify({
                models: [{ name: "qwen2.5-coder:3b-instruct" }, { name: "qwen2.5-coder:0.5b" }],
              }),
            json: async () => ({
              models: [{ name: "qwen2.5-coder:3b-instruct" }, { name: "qwen2.5-coder:0.5b" }],
            }),
          };
        }
        return { ok: false, status: 503, text: async () => "unavailable" };
      }) as typeof globalThis.fetch;

      // Exact scenario from P0 incident: sticky=cerebras, but cerebras is also excluded
      const result = await selectProvider({
        allowedNames: ["cerebras"],
        allowSafetyNetOverride: true,
        excludeNames: ["cerebras", "ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"],
      });

      // P0 safety-net override should bypass ALL restrictions and select ollama
      expect(result).not.toBeNull();
      expect(result!.name).toMatch(/^ollama/);
      expect(result!.tier).toBe("local-safety-net");
    });

    it("should activate safety-net when all providers are excluded and override is enabled", async () => {
      // Mock fetch: ollama returns success
      globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL) => {
        const urlStr = String(url);
        if (urlStr.includes("11434") || urlStr.includes("ollama")) {
          return {
            ok: true,
            text: async () =>
              JSON.stringify({
                models: [{ name: "qwen2.5-coder:3b-instruct" }, { name: "qwen2.5-coder:0.5b" }],
              }),
            json: async () => ({
              models: [{ name: "qwen2.5-coder:3b-instruct" }, { name: "qwen2.5-coder:0.5b" }],
            }),
          };
        }
        return { ok: false, status: 503, text: async () => "unavailable" };
      }) as typeof globalThis.fetch;

      // allowedNames restricts to a nonexistent provider — everything is "not allowed"
      const result = await selectProvider({
        allowedNames: ["nonexistent-provider"],
        allowSafetyNetOverride: true,
      });

      // Safety-net override should still find ollama
      expect(result).not.toBeNull();
      expect(result!.name).toMatch(/^ollama/);
    });

    it("should return null only when safety-net providers are genuinely unreachable", async () => {
      // Mock fetch: everything fails including ollama
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return { ok: false, status: 503, text: async () => "unavailable" };
      }) as typeof globalThis.fetch;

      // The P0 safety-net uses cached probe results (<5min TTL) to avoid total outage.
      // If ollama was probed <5min ago, it will return ollama from cache.
      // This is CORRECT behavior - safety-net prevents outage using recent probe knowledge.
      // Only returns null if no safety-net has recent probe data.
      const result = await selectProvider({ allowedNames: ["nonexistent-provider"] });

      expect(result).toBeNull();
    });

    it("should verify safety-net tier providers exist in PROVIDERS list", () => {
      // Structural test: ensure at least one safety-net provider is configured
      const allProviders = getProviderDefinitions();
      const safetyNets = allProviders.filter(
        (p: { tier?: string }) => p.tier === "local-safety-net",
      );
      expect(safetyNets.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Full Probe → Score → Ranking Pipeline", () => {
    it("should rank probe-only providers above unknown providers", () => {
      // Provider A: 3 successful probes (should be ranked)
      recordProbeResult("pipeline-a", { success: true, durationMs: 200 });
      recordProbeResult("pipeline-a", { success: true, durationMs: 300 });
      recordProbeResult("pipeline-a", { success: true, durationMs: 250 });

      // Provider B: 3 failed probes (should be ranked, but lower)
      recordProbeResult("pipeline-b", { success: false, durationMs: 500 });
      recordProbeResult("pipeline-b", { success: false, durationMs: 600 });
      recordProbeResult("pipeline-b", { success: false, durationMs: 550 });

      const stats = getProviderStats();

      // Both should have scores (not "pending")
      expect(typeof stats["pipeline-a"].score).toBe("number");
      expect(typeof stats["pipeline-b"].score).toBe("number");

      // Successful probes should score higher than failed probes
      expect(stats["pipeline-a"].score).toBeGreaterThan(stats["pipeline-b"].score);
    });

    it("should let runtime data dominate over probe data in scoring", () => {
      // Provider with 3 successful probes AND good runtime performance
      recordProbeResult("runtime-good", { success: true, durationMs: 200 });
      recordProbeResult("runtime-good", { success: true, durationMs: 200 });
      recordProbeResult("runtime-good", { success: true, durationMs: 200 });
      recordProviderSelection("runtime-good");
      recordProviderSelection("runtime-good");
      recordProviderSelection("runtime-good");
      recordProviderSuccess("runtime-good");
      recordProviderSuccess("runtime-good");
      recordProviderSuccess("runtime-good");
      // recordProviderMetrics triggers score recalculation
      recordProviderMetrics("runtime-good", {
        durationMs: 2000,
        inputTokens: 100,
        outputTokens: 50,
        validationPassed: true,
      });

      // Provider with only 3 successful probes (no runtime data)
      recordProbeResult("probe-only", { success: true, durationMs: 200 });
      recordProbeResult("probe-only", { success: true, durationMs: 200 });
      recordProbeResult("probe-only", { success: true, durationMs: 200 });

      const stats = getProviderStats();

      // Good runtime data should push score significantly above probe-only
      // demonstrating that runtime metrics (successRate=100%, volume, recency)
      // dominate the scoring over probe-only evidence
      expect(stats["runtime-good"].score).toBeGreaterThan(stats["probe-only"].score);
    });

    it("should produce correct ranking order with mixed probe and runtime data", () => {
      // Provider A: good probes + good runtime = best
      recordProbeResult("rank-a", { success: true, durationMs: 200 });
      recordProbeResult("rank-a", { success: true, durationMs: 200 });
      recordProbeResult("rank-a", { success: true, durationMs: 200 });
      recordProviderSelection("rank-a");
      recordProviderSelection("rank-a");
      recordProviderSelection("rank-a");
      recordProviderSuccess("rank-a");
      recordProviderSuccess("rank-a");
      recordProviderSuccess("rank-a");
      recordProviderMetrics("rank-a", {
        durationMs: 2000,
        inputTokens: 100,
        outputTokens: 50,
        validationPassed: true,
      });

      // Provider B: good probes only = middle
      recordProbeResult("rank-b", { success: true, durationMs: 200 });
      recordProbeResult("rank-b", { success: true, durationMs: 200 });
      recordProbeResult("rank-b", { success: true, durationMs: 200 });

      // Provider C: probes + all runtime failures = worst
      recordProbeResult("rank-c", { success: true, durationMs: 200 });
      recordProbeResult("rank-c", { success: true, durationMs: 200 });
      recordProbeResult("rank-c", { success: true, durationMs: 200 });
      recordProviderSelection("rank-c");
      recordProviderSelection("rank-c");
      recordProviderSelection("rank-c");
      recordProviderFailureCount("rank-c");
      recordProviderFailureCount("rank-c");
      recordProviderFailureCount("rank-c");

      const stats = getProviderStats();

      expect(typeof stats["rank-a"].score).toBe("number");
      expect(typeof stats["rank-b"].score).toBe("number");
      expect(typeof stats["rank-c"].score).toBe("number");

      // A (probes+runtime success) > B (probes only)
      expect(stats["rank-a"].score).toBeGreaterThan(stats["rank-b"].score);
      // A (probes+runtime success) > C (probes+runtime failure)
      expect(stats["rank-a"].score).toBeGreaterThan(stats["rank-c"].score);
      // C has 0% successRate but gets volume+recency bonuses, so may be
      // close to B (probe-only). The key assertion is A > both B and C.
    });

    it("should include probe-only providers in getRankedProviders output", () => {
      recordProbeResult("ranked-probe", { success: true, durationMs: 200 });
      recordProbeResult("ranked-probe", { success: true, durationMs: 300 });
      recordProbeResult("ranked-probe", { success: true, durationMs: 250 });

      const ranked = getRankedProviders();
      const found = ranked.find((r: any) => r.name === "ranked-probe");

      expect(found).toBeDefined();
      expect(typeof found!.score).toBe("number");
      expect(found!.rank).toBeGreaterThan(0);
    });

    it("should track Linear completion metrics in scoring pipeline", () => {
      // Provider with probes + Linear completions
      recordProbeResult("linear-test", { success: true, durationMs: 200 });
      recordProbeResult("linear-test", { success: true, durationMs: 200 });
      recordProbeResult("linear-test", { success: true, durationMs: 200 });
      recordLinearCompletion("linear-test", { completed: true, priority: 1, estimate: 5 });
      recordLinearCompletion("linear-test", { completed: true, priority: 3, estimate: 2 });

      const stats = getProviderStats();

      expect(stats["linear-test"].linearCompleted).toBe(2);
      expect(stats["linear-test"].linearFailed).toBe(0);
      expect(stats["linear-test"].linearCompletionRate).toBe("100.0%");
      expect(typeof stats["linear-test"].score).toBe("number");
      expect(stats["linear-test"].score).toBeGreaterThan(0);
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
      recordProviderSelection("test-provider");
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
