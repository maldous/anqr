import { describe, it, expect } from "vitest";
import { diffMatrices } from "./diff-matrices";

describe("diffMatrices", () => {
  it("should return zero diff for identical matrices", () => {
    const a = [
      [true, false],
      [false, true],
    ];
    const b = [
      [true, false],
      [false, true],
    ];
    const result = diffMatrices(a, b);
    expect(result.diffCount).toBe(0);
    expect(result.diffPct).toBe(0);
    expect(result.firstDiff).toBeNull();
  });

  it("should count differences between matrices", () => {
    const a = [
      [true, false],
      [false, true],
    ];
    const b = [
      [false, false],
      [false, false],
    ];
    const result = diffMatrices(a, b);
    expect(result.diffCount).toBe(2);
    expect(result.diffPct).toBe(0.5);
  });

  it("should track first difference", () => {
    const a = [
      [true, false],
      [false, true],
    ];
    const b = [
      [false, false],
      [false, true],
    ];
    const result = diffMatrices(a, b);
    expect(result.firstDiff).toEqual({ row: 0, col: 0, a: true, b: false });
  });

  it("should handle empty matrices", () => {
    const result = diffMatrices([], []);
    expect(result.diffCount).toBe(0);
    expect(result.diffPct).toBe(0);
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(0);
  });

  it("should handle different sized matrices", () => {
    const a = [
      [true, false, true],
      [false, true, false],
    ];
    const b = [[true, false]];
    const result = diffMatrices(a, b);
    expect(result.rows).toBe(1);
    expect(result.cols).toBe(2);
  });

  it("should calculate percentage correctly", () => {
    const a = [
      [true, true, true, true],
      [true, true, true, true],
    ];
    const b = [
      [false, false, false, false],
      [false, false, false, false],
    ];
    const result = diffMatrices(a, b);
    expect(result.diffCount).toBe(8);
    expect(result.diffPct).toBe(1);
  });

  it("should return 0 percentage for empty total", () => {
    const a: boolean[][] = [[]];
    const b: boolean[][] = [[]];
    const result = diffMatrices(a, b);
    expect(result.diffPct).toBe(0);
  });
});
