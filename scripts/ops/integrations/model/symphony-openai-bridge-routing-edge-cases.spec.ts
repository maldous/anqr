import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { selectProvider } from "./symphony-credit-gate.mjs";

// SKIPPED: This test was written for the old tier/score-based selectProvider(score, retryCount) API.
// The current selectProvider(options) API uses a preferred-provider + dynamic-ranking model
// (see symphony-credit-gate.mjs). These tests need to be rewritten for the new API.
describe.skip("Provider Routing Edge Cases", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment for each test
    process.env.SYMPHONY_TIER_1_PROVIDERS = "openai:gpt-4o";
    process.env.SYMPHONY_TIER_2_PROVIDERS = "anthropic:claude-3-5-sonnet-20241022";
    process.env.SYMPHONY_TIER_3_PROVIDERS = "groq:llama-3.3-70b-versatile";
    process.env.SYMPHONY_SAFETY_NET_PROVIDER = "openrouter:openai/gpt-4o";
    process.env.SYMPHONY_SAFETY_NET_SCORE_CEILING = "75";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("Tier Boundary Conditions", () => {
    it("should select tier 1 when score is exactly at tier 1 minimum (90)", () => {
      const result = selectProvider(90, 0);
      expect(result.tier).toBe(1);
      expect(result.provider).toContain("openai");
    });

    it("should select tier 2 when score is exactly at tier 2 minimum (80)", () => {
      const result = selectProvider(80, 0);
      expect(result.tier).toBe(2);
      expect(result.provider).toContain("anthropic");
    });

    it("should select tier 3 when score is exactly at tier 3 minimum (70)", () => {
      const result = selectProvider(70, 0);
      expect(result.tier).toBe(3);
      expect(result.provider).toContain("groq");
    });

    it("should handle score just below tier boundary (89.9 → tier 2)", () => {
      const result = selectProvider(89.9, 0);
      expect(result.tier).toBe(2);
    });

    it("should handle score just above tier boundary (90.1 → tier 1)", () => {
      const result = selectProvider(90.1, 0);
      expect(result.tier).toBe(1);
    });

    it("should handle maximum score (100)", () => {
      const result = selectProvider(100, 0);
      expect(result.tier).toBe(1);
      expect(result.provider).toContain("openai");
    });

    it("should handle minimum valid score (0)", () => {
      const result = selectProvider(0, 0);
      expect(result.tier).toBe(3);
    });

    it("should handle negative scores (treat as 0)", () => {
      const result = selectProvider(-10, 0);
      expect(result.tier).toBe(3);
    });

    it("should handle scores above 100 (clamp to 100)", () => {
      const result = selectProvider(150, 0);
      expect(result.tier).toBe(1);
    });
  });

  describe("Safety Net Score Ceiling Validation", () => {
    it("should use safety net when score is exactly at ceiling (75)", () => {
      const result = selectProvider(75, 0);
      expect(result.provider).toContain("openrouter");
      expect(result.isSafetyNet).toBe(true);
    });

    it("should use safety net when score is below ceiling (74)", () => {
      const result = selectProvider(74, 0);
      expect(result.provider).toContain("openrouter");
      expect(result.isSafetyNet).toBe(true);
    });

    it("should NOT use safety net when score is just above ceiling (76)", () => {
      const result = selectProvider(76, 0);
      expect(result.provider).not.toContain("openrouter");
      expect(result.isSafetyNet).toBe(false);
    });

    it("should handle safety net ceiling at 0 (never use safety net except score 0)", () => {
      process.env.SYMPHONY_SAFETY_NET_SCORE_CEILING = "0";
      const result = selectProvider(0, 0);
      expect(result.isSafetyNet).toBe(true);
    });

    it("should handle safety net ceiling at 100 (always use safety net)", () => {
      process.env.SYMPHONY_SAFETY_NET_SCORE_CEILING = "100";
      const result = selectProvider(95, 0);
      expect(result.isSafetyNet).toBe(true);
    });

    it("should handle missing safety net ceiling (default to no ceiling check)", () => {
      delete process.env.SYMPHONY_SAFETY_NET_SCORE_CEILING;
      const result = selectProvider(50, 0);
      // Should still route to tier 3, not safety net
      expect(result.tier).toBe(3);
    });

    it("should handle invalid safety net ceiling (non-numeric)", () => {
      process.env.SYMPHONY_SAFETY_NET_SCORE_CEILING = "invalid";
      const result = selectProvider(50, 0);
      expect(result.tier).toBe(3); // Fallback to tier routing
    });
  });

  describe("Cooldown and Retry Logic", () => {
    it("should skip tier 1 when retry_count=1 (tier 1 exhausted)", () => {
      const result = selectProvider(95, 1);
      expect(result.tier).toBe(2);
      expect(result.provider).toContain("anthropic");
    });

    it("should skip tier 1 and 2 when retry_count=2 (both exhausted)", () => {
      const result = selectProvider(95, 2);
      expect(result.tier).toBe(3);
      expect(result.provider).toContain("groq");
    });

    it("should use safety net when retry_count=3 (all tiers exhausted)", () => {
      const result = selectProvider(95, 3);
      expect(result.isSafetyNet).toBe(true);
      expect(result.provider).toContain("openrouter");
    });

    it("should handle retry_count=4+ (still use safety net)", () => {
      const result = selectProvider(95, 4);
      expect(result.isSafetyNet).toBe(true);
    });

    it("should respect tier boundaries even with retry_count", () => {
      // Score 85 normally → tier 2, but retry_count=1 skips tier 1, so still tier 2
      const result = selectProvider(85, 1);
      expect(result.tier).toBe(2);
    });

    it("should handle retry_count with low score (safety net boundary)", () => {
      // Score 74 normally → safety net, retry_count shouldn't change this
      const result = selectProvider(74, 0);
      expect(result.isSafetyNet).toBe(true);
    });

    it("should handle negative retry_count (treat as 0)", () => {
      const result = selectProvider(95, -1);
      expect(result.tier).toBe(1);
    });

    it("should handle very large retry_count", () => {
      const result = selectProvider(95, 999);
      expect(result.isSafetyNet).toBe(true);
    });
  });

  describe("Provider Degradation Scenarios", () => {
    it("should handle missing tier 1 provider (skip to tier 2)", () => {
      delete process.env.SYMPHONY_TIER_1_PROVIDERS;
      const result = selectProvider(95, 0);
      expect(result.tier).toBe(2);
      expect(result.provider).toContain("anthropic");
    });

    it("should handle missing tier 2 provider (skip to tier 3)", () => {
      delete process.env.SYMPHONY_TIER_2_PROVIDERS;
      const result = selectProvider(85, 0);
      expect(result.tier).toBe(3);
      expect(result.provider).toContain("groq");
    });

    it("should handle missing all tier providers (use safety net)", () => {
      delete process.env.SYMPHONY_TIER_1_PROVIDERS;
      delete process.env.SYMPHONY_TIER_2_PROVIDERS;
      delete process.env.SYMPHONY_TIER_3_PROVIDERS;
      const result = selectProvider(95, 0);
      expect(result.isSafetyNet).toBe(true);
    });

    it("should handle empty tier provider strings", () => {
      process.env.SYMPHONY_TIER_1_PROVIDERS = "";
      const result = selectProvider(95, 0);
      expect(result.tier).toBe(2);
    });

    it("should handle malformed provider strings (missing colon)", () => {
      process.env.SYMPHONY_TIER_1_PROVIDERS = "invalid-format";
      const result = selectProvider(95, 0);
      // Should skip malformed and use tier 2
      expect(result.tier).toBe(2);
    });

    it("should handle multiple providers in tier (round-robin or first)", () => {
      process.env.SYMPHONY_TIER_1_PROVIDERS = "openai:gpt-4o,anthropic:claude-3-opus";
      const result = selectProvider(95, 0);
      expect(result.tier).toBe(1);
      expect(result.provider).toMatch(/openai|anthropic/);
    });

    it("should handle missing safety net provider (fall back to tier 3)", () => {
      delete process.env.SYMPHONY_SAFETY_NET_PROVIDER;
      const result = selectProvider(50, 0);
      expect(result.tier).toBe(3);
    });

    it("should handle safety net provider with retry exhaustion", () => {
      const result = selectProvider(95, 3);
      expect(result.isSafetyNet).toBe(true);
      expect(result.provider).toContain("openrouter");
    });
  });

  describe("Combined Edge Cases", () => {
    it("should handle boundary score + retry count", () => {
      // Score 90 (tier 1 minimum) + retry 1 (skip tier 1) = tier 2
      const result = selectProvider(90, 1);
      expect(result.tier).toBe(2);
    });

    it("should handle safety net ceiling + retry count", () => {
      // Score 75 (at ceiling) + retry 0 = safety net
      const result = selectProvider(75, 0);
      expect(result.isSafetyNet).toBe(true);
    });

    it("should handle missing tier + retry count", () => {
      delete process.env.SYMPHONY_TIER_1_PROVIDERS;
      // Score 95 (tier 1) but missing + retry 0 = tier 2
      const result = selectProvider(95, 0);
      expect(result.tier).toBe(2);
    });

    it("should handle all degradation + high retry", () => {
      delete process.env.SYMPHONY_TIER_1_PROVIDERS;
      delete process.env.SYMPHONY_TIER_2_PROVIDERS;
      const result = selectProvider(95, 2);
      // All tiers degraded or exhausted → safety net
      expect(result.isSafetyNet).toBe(true);
    });
  });
});
