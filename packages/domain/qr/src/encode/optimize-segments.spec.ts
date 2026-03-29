import { describe, it, expect } from "vitest";
import { optimizeSegments } from "./optimize-segments";

describe("optimizeSegments", () => {
  it("should return empty array for empty string", () => {
    expect(optimizeSegments("")).toEqual([]);
  });

  it("should optimize numeric-only data", () => {
    const result = optimizeSegments("123456789");
    expect(result).toHaveLength(1);
    expect(result[0].mode).toBe("numeric");
    expect(result[0].data).toBe("123456789");
  });

  it("should optimize alphanumeric data", () => {
    const result = optimizeSegments("HELLO WORLD");
    expect(result).toHaveLength(1);
    expect(result[0].mode).toBe("alphanumeric");
  });

  it("should use byte mode for mixed case", () => {
    const result = optimizeSegments("Hello World");
    expect(result.some((seg) => seg.mode === "byte")).toBe(true);
  });

  it("should segment numeric runs of 4+ characters", () => {
    const result = optimizeSegments("12345");
    expect(result.some((seg) => seg.mode === "numeric")).toBe(true);
  });

  it("should segment alphanumeric runs of 6+ characters", () => {
    const result = optimizeSegments("12ABCDEFGH34");
    const alphaSegment = result.find((seg) => seg.mode === "alphanumeric");
    expect(alphaSegment).toBeDefined();
  });

  it("should handle URL with optimal segmentation", () => {
    const result = optimizeSegments("HTTPS://EXAMPLE.COM/12345");
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((seg) => seg.mode === "alphanumeric")).toBe(true);
  });

  it("should handle mixed content efficiently", () => {
    const result = optimizeSegments("Name:JOHN DOE,ID:123456");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should merge adjacent segments of same mode", () => {
    const result = optimizeSegments("ABCDEF");
    expect(result).toHaveLength(1);
  });

  it("should handle special characters", () => {
    const result = optimizeSegments("hello@example.com");
    expect(result.some((seg) => seg.mode === "byte")).toBe(true);
  });

  it("should handle unicode characters", () => {
    const result = optimizeSegments("Hello 世界");
    expect(result.some((seg) => seg.mode === "byte")).toBe(true);
  });

  it("should not create numeric segment for runs < 4", () => {
    const result = optimizeSegments("AB123CD");
    expect(result.every((seg) => seg.mode !== "numeric")).toBe(true);
  });

  it("should not create alphanumeric segment for runs < 6", () => {
    const result = optimizeSegments("12ABC34");
    const shortAlpha = result.filter((seg) => seg.mode === "alphanumeric" && seg.data.length < 6);
    expect(shortAlpha).toHaveLength(0);
  });
});
