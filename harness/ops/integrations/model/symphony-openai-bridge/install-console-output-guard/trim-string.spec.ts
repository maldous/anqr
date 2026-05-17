/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { trimString } = await import("./trim-string.mjs");

describe("trimString", () => {
  it("should return short strings as-is", () => {
    expect(trimString("hello")).toBe("hello");
  });

  it("should truncate long strings with ellipsis", () => {
    const long = "a".repeat(300);
    const result = trimString(long);
    expect(result.length).toBe(241); // 240 + ellipsis
    expect(result.endsWith("…")).toBe(true);
  });

  it("should use custom limit", () => {
    const long = "a".repeat(100);
    expect(trimString(long, 10).length).toBe(11); // 10 + ellipsis
  });

  it("should handle empty strings", () => {
    expect(trimString("")).toBe("");
  });

  it("should convert null/undefined to empty string", () => {
    expect(trimString(null)).toBe("");
    expect(trimString(undefined)).toBe("");
  });
});
