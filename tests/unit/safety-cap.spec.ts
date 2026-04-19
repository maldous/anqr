import { describe, it, expect } from "vitest";

import { safetyCap } from "../../harness/ops/lib/safety-cap.mjs";

describe("safetyCap", () => {
  it("returns empty string for null/undefined/empty input", () => {
    expect(safetyCap(null as unknown as string)).toBe("");
    expect(safetyCap(undefined as unknown as string)).toBe("");
    expect(safetyCap("")).toBe("");
  });

  it("returns short text unchanged", () => {
    const short = "Something went wrong: rate limit exceeded";
    expect(safetyCap(short)).toBe(short);
  });

  it("returns text under 50K chars unchanged", () => {
    const medium = "x".repeat(49_999);
    expect(safetyCap(medium)).toBe(medium);
  });

  it("truncates text over 50K chars with indicator", () => {
    const long = "a".repeat(60_000);
    const result = safetyCap(long);
    expect(result.length).toBeGreaterThan(50_000);
    expect(result.length).toBeLessThan(51_000);
    expect(result.startsWith("a".repeat(50_000))).toBe(true);
    expect(result).toContain("truncated at 50K chars");
  });

  it("preserves meaningful error content within the cap", () => {
    const errorText = [
      "Error: Too Many Requests",
      "Provider: codebuff-direct",
      "Attempt: 4/4",
      "Last error: Rate limit exceeded for model gpt-4",
      "Stack: at retryLoop (bridge.mjs:123)",
    ].join("\n");
    expect(safetyCap(errorText)).toBe(errorText);
  });

  it("handles unicode text correctly", () => {
    const unicode = "🎉 ✅ ❌ 🚫 ⚠️ ℹ️ 🔄 🤖".repeat(1000);
    const result = safetyCap(unicode);
    // Should either fit entirely or truncate with indicator
    if (result.length > 50_000) {
      expect(result).toContain("truncated at 50K chars");
    }
  });
});
