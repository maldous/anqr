import { describe, it, expect } from "vitest";
import { formatMilliseconds } from "./format-milliseconds";

describe("formatMilliseconds", () => {
  it("should format positive milliseconds", () => {
    expect(formatMilliseconds(123.456)).toBe("123.46 ms");
  });

  it("should format zero", () => {
    expect(formatMilliseconds(0)).toBe("0.00 ms");
  });

  it("should format small values", () => {
    expect(formatMilliseconds(0.12)).toBe("0.12 ms");
  });

  it("should format large values", () => {
    expect(formatMilliseconds(9999.99)).toBe("9999.99 ms");
  });

  it("should return N/A for null", () => {
    expect(formatMilliseconds(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatMilliseconds(undefined)).toBe("N/A");
  });

  it("should return N/A for NaN", () => {
    expect(formatMilliseconds(NaN)).toBe("N/A");
  });

  it("should round to 2 decimal places", () => {
    expect(formatMilliseconds(123.456789)).toBe("123.46 ms");
  });

  it("should handle very small decimal values", () => {
    expect(formatMilliseconds(0.001)).toBe("0.00 ms");
  });
});
