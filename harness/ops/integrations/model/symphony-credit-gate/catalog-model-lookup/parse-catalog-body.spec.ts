/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { parseCatalogBody } = await import("./parse-catalog-body.mjs");

describe("parseCatalogBody", () => {
  it("should parse JSON catalog", () => {
    const result = parseCatalogBody('{"data":[{"model":"gpt-4"},{"model":"claude-3"}]}');
    expect(result.format).toBe("json");
    expect(result.tokens.has("gpt-4")).toBe(true);
    expect(result.tokens.has("claude-3")).toBe(true);
  });

  it("should fall back to text parsing on JSON parse failure", () => {
    const result = parseCatalogBody("gpt-4, claude-3");
    expect(result.format).toBe("text");
    expect(result.tokens.has("gpt-4")).toBe(true);
    expect(result.tokens.has("claude-3")).toBe(true);
  });

  it("should handle empty input", () => {
    const result = parseCatalogBody("");
    expect(result.format).toBe("text");
    expect(result.tokens.size).toBe(0);
  });

  it("should include relevant keys from JSON catalog", () => {
    const result = parseCatalogBody(
      JSON.stringify({
        data: [{ id: "gpt-4o", model: "gpt-4o-2024-08-06", name: "GPT-4o" }],
      }),
    );
    expect(result.format).toBe("json");
    expect(result.tokens.has("gpt-4o")).toBe(true);
    expect(result.tokens.has("gpt-4o-2024-08-06")).toBe(true);
    expect(result.tokens.has("gpt-4o")).toBe(true);
  });
});
