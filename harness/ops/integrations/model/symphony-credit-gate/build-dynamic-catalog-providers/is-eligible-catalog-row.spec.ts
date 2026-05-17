import { describe, it, expect } from "vitest";

const { isEligibleCatalogRow } = await import("./is-eligible-catalog-row.mjs");

describe("isEligibleCatalogRow", () => {
  it("should accept a standard text model", () => {
    const row = { model: "gpt-4o", raw: {} };
    expect(isEligibleCatalogRow(row)).toBe(true);
  });

  it("should reject empty model", () => {
    expect(isEligibleCatalogRow({})).toBe(false);
    expect(isEligibleCatalogRow({ model: "" })).toBe(false);
  });

  it("should reject excluded patterns (whisper)", () => {
    expect(isEligibleCatalogRow({ model: "whisper-1" })).toBe(false);
  });

  it("should reject excluded patterns (embedding)", () => {
    expect(isEligibleCatalogRow({ model: "text-embedding-3-small" })).toBe(false);
  });

  it("should reject excluded patterns (rerank)", () => {
    expect(isEligibleCatalogRow({ model: "rerank-model" })).toBe(false);
  });

  it("should reject excluded patterns (vision)", () => {
    expect(isEligibleCatalogRow({ model: "claude-3-vision" })).toBe(false);
    // But reject "vision" specifically, not just substrings
  });

  it("should reject toolSupport=unsupported", () => {
    const row = { model: "gpt-4", toolSupport: "unsupported", raw: {} };
    expect(isEligibleCatalogRow(row)).toBe(false);
  });
});
