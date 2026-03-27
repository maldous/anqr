import { describe, it, expect } from "vitest";
import { mergeAdjacentSegments } from "./merge-adjacent-segments";
import type { DataSegment } from "./encoder-api.types";

describe("mergeAdjacentSegments", () => {
  it("should merge adjacent segments with same mode", () => {
    const segments: DataSegment[] = [
      { data: "ABC", mode: "alphanumeric" },
      { data: "DEF", mode: "alphanumeric" },
    ];
    const result = mergeAdjacentSegments(segments);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ data: "ABCDEF", mode: "alphanumeric" });
  });

  it("should not merge segments with different modes", () => {
    const segments: DataSegment[] = [
      { data: "ABC", mode: "alphanumeric" },
      { data: "123", mode: "numeric" },
    ];
    const result = mergeAdjacentSegments(segments);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ data: "ABC", mode: "alphanumeric" });
    expect(result[1]).toEqual({ data: "123", mode: "numeric" });
  });

  it("should handle empty array", () => {
    const result = mergeAdjacentSegments([]);
    expect(result).toEqual([]);
  });

  it("should handle single segment", () => {
    const segments: DataSegment[] = [{ data: "TEST", mode: "byte" }];
    const result = mergeAdjacentSegments(segments);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ data: "TEST", mode: "byte" });
  });

  it("should merge multiple consecutive same-mode segments", () => {
    const segments: DataSegment[] = [
      { data: "A", mode: "alphanumeric" },
      { data: "B", mode: "alphanumeric" },
      { data: "C", mode: "alphanumeric" },
    ];
    const result = mergeAdjacentSegments(segments);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ data: "ABC", mode: "alphanumeric" });
  });

  it("should handle mixed mode segments", () => {
    const segments: DataSegment[] = [
      { data: "ABC", mode: "alphanumeric" },
      { data: "123", mode: "numeric" },
      { data: "DEF", mode: "alphanumeric" },
      { data: "456", mode: "numeric" },
    ];
    const result = mergeAdjacentSegments(segments);
    expect(result).toHaveLength(4);
  });

  it("should preserve original segments (not mutate)", () => {
    const segments: DataSegment[] = [
      { data: "ABC", mode: "alphanumeric" },
      { data: "DEF", mode: "alphanumeric" },
    ];
    const original = [...segments];
    mergeAdjacentSegments(segments);
    expect(segments).toEqual(original);
  });
});
