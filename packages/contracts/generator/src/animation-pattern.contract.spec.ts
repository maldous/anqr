import { describe, expect, it } from "vitest";
import type { AnimationPatternType } from "./animation-pattern.contract";

describe("AnimationPatternType", () => {
  const patterns: AnimationPatternType[] = [
    "none",
    "pulse",
    "wave",
    "scanline",
    "shimmer",
    "drift",
    "color_cycle",
  ];

  patterns.forEach((pattern) => {
    it(`should allow ${pattern}`, () => {
      const animPattern: AnimationPatternType = pattern;
      expect(animPattern).toBe(pattern);
    });
  });
});
