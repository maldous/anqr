/**
 * Regression tests for provider tool-capability checks and defensive timing.
 *
 * Covers:
 * - providerSupportsTools strict mode rejects unprobed providers
 * - providerSupportsTools allows known-tool-capable providers
 * - formatElapsed handles edge cases (zero, negative, undefined-safe)
 */

import { describe, it, expect, beforeEach } from "vitest";

describe("providerSupportsTools", () => {
  let providerSupportsTools: (name: string, opts?: { strict?: boolean }) => boolean;
  let nonToolCapableProviders: Set<string>;
  let toolCapableProviders: Set<string>;

  beforeEach(async () => {
    const mod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/provider-supports-tools.mjs"
    );
    providerSupportsTools = mod.providerSupportsTools;

    const nonToolMod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/non-tool-capable-providers.mjs"
    );
    nonToolCapableProviders = nonToolMod.nonToolCapableProviders;

    const toolMod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/tool-capable-providers.mjs"
    );
    toolCapableProviders = toolMod.toolCapableProviders;
  });

  it("rejects non-tool-capable providers in both modes", () => {
    nonToolCapableProviders.add("test-non-tool-provider");
    try {
      expect(providerSupportsTools("test-non-tool-provider")).toBe(false);
      expect(providerSupportsTools("test-non-tool-provider", { strict: true })).toBe(false);
    } finally {
      nonToolCapableProviders.delete("test-non-tool-provider");
    }
  });

  it("allows probed tool-capable providers in both modes", () => {
    toolCapableProviders.add("test-probed-tool-provider");
    try {
      expect(providerSupportsTools("test-probed-tool-provider")).toBe(true);
      expect(providerSupportsTools("test-probed-tool-provider", { strict: true })).toBe(true);
    } finally {
      toolCapableProviders.delete("test-probed-tool-provider");
    }
  });

  it("allows known-tool-capable providers in both modes", () => {
    // "groq" is in KNOWN_TOOL_CAPABLE
    expect(providerSupportsTools("groq")).toBe(true);
    expect(providerSupportsTools("groq", { strict: true })).toBe(true);
  });

  it("strict mode REJECTS unprobed unknown providers", () => {
    // An unprobed provider not in any set should be rejected in strict mode
    const unknownProvider = `unknown-provider-${Date.now()}`;
    expect(providerSupportsTools(unknownProvider, { strict: true })).toBe(false);
  });

  it("default mode optimistically ALLOWS unprobed unknown providers", () => {
    const unknownProvider = `unknown-provider-${Date.now()}`;
    expect(providerSupportsTools(unknownProvider)).toBe(true);
    expect(providerSupportsTools(unknownProvider, { strict: false })).toBe(true);
  });
});

describe("formatElapsed", () => {
  let formatElapsed: (ms: number) => string;

  beforeEach(async () => {
    const mod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/format-elapsed.mjs"
    );
    formatElapsed = mod.formatElapsed;
  });

  it("formats milliseconds correctly", () => {
    expect(formatElapsed(500)).toBe("500ms");
    expect(formatElapsed(0)).toBe("0ms");
  });

  it("formats seconds correctly", () => {
    expect(formatElapsed(2600)).toBe("2.6s");
    expect(formatElapsed(1000)).toBe("1.0s");
  });

  it("formats minutes correctly", () => {
    expect(formatElapsed(120000)).toBe("2.0min");
    expect(formatElapsed(60000)).toBe("1.0min");
  });

  it("handles edge case: negative ms (defensive timing)", () => {
    // If startTime is undefined/NaN, Date.now() - undefined = NaN
    // formatElapsed should not throw — it may return NaN but must not crash
    const result = formatElapsed(NaN);
    expect(typeof result).toBe("string");
  });
});

describe("getEffectiveProviderScoreWithBreakdown", () => {
  let getEffectiveProviderScoreWithBreakdown: (
    name: string,
    base: number,
    stats: Record<string, unknown>,
    health: Record<string, unknown> | null,
    probe: Record<string, unknown> | null,
  ) => { effective: number; breakdown: Record<string, number> };

  beforeEach(async () => {
    const mod = await import(
      "../../harness/ops/integrations/model/symphony-credit-gate/get-effective-provider-score-with-breakdown.mjs"
    );
    getEffectiveProviderScoreWithBreakdown = mod.getEffectiveProviderScoreWithBreakdown;
  });

  it("returns effective score and breakdown components", () => {
    const result = getEffectiveProviderScoreWithBreakdown(
      "test-provider",
      0.8,
      {},
      null,
      null,
    );
    expect(result.effective).toBeGreaterThanOrEqual(0);
    expect(result.breakdown).toBeDefined();
    expect(typeof result.breakdown.baseScore).toBe("number");
    expect(typeof result.breakdown.healthPenalty).toBe("number");
    expect(typeof result.breakdown.cachePenalty).toBe("number");
    expect(typeof result.breakdown.preferenceBoost).toBe("number");
    expect(typeof result.breakdown.recentSuccessBoost).toBe("number");
    expect(result.breakdown.baseScore).toBe(0.8);
  });

  it("breakdown components sum correctly to effective score", () => {
    const result = getEffectiveProviderScoreWithBreakdown(
      "test-provider",
      0.5,
      {},
      null,
      null,
    );
    const { baseScore, preferenceBoost, recentSuccessBoost, healthPenalty, cachePenalty } =
      result.breakdown;
    const expected = Math.max(
      0,
      Math.round(
        (baseScore + preferenceBoost + recentSuccessBoost - healthPenalty - cachePenalty) * 100,
      ) / 100,
    );
    expect(result.effective).toBe(expected);
  });
});
