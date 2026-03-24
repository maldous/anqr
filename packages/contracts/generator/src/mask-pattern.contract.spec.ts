import { describe, expect, it } from "vitest";
import type { MaskPattern } from "./mask-pattern.contract";

describe("MaskPattern", () => {
  it("should allow auto", () => {
    const pattern: MaskPattern = "auto";
    expect(pattern).toBe("auto");
  });

  const numericPatterns: MaskPattern[] = [0, 1, 2, 3, 4, 5, 6, 7];

  numericPatterns.forEach((pattern) => {
    it(`should allow ${pattern}`, () => {
      const maskPattern: MaskPattern = pattern;
      expect(maskPattern).toBe(pattern);
    });
  });
});
