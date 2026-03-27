import { describe, it, expect } from "vitest";
import { scanNumericRun } from "./scan-numeric-run";

describe("scanNumericRun", () => {
  it("should scan numeric characters from start", () => {
    expect(scanNumericRun("123ABC", 0)).toBe(3);
  });

  it("should return start index when no numeric characters", () => {
    expect(scanNumericRun("ABC123", 0)).toBe(0);
  });

  it("should scan from middle of string", () => {
    expect(scanNumericRun("ABC123DEF", 3)).toBe(6);
  });

  it("should scan entire numeric string", () => {
    expect(scanNumericRun("0123456789", 0)).toBe(10);
  });

  it("should handle single numeric character", () => {
    expect(scanNumericRun("1", 0)).toBe(1);
  });

  it("should handle empty string", () => {
    expect(scanNumericRun("", 0)).toBe(0);
  });

  it("should stop at first non-numeric character", () => {
    expect(scanNumericRun("123.456", 0)).toBe(3);
  });

  it("should handle start at end of string", () => {
    expect(scanNumericRun("123", 3)).toBe(3);
  });
});
