import { describe, it, expect } from "vitest";
import type { AnimationPattern } from "./animation-pattern-alias.contract";

describe("animation-pattern-alias.contract", () => {
  describe("AnimationPattern type alias", () => {
    it("should accept all valid animation pattern types", () => {
      const patterns: AnimationPattern[] = [
        "none",
        "pulse",
        "wave",
        "scanline",
        "shimmer",
        "drift",
        "color_cycle",
      ];
      expect(patterns).toHaveLength(7);
      expect(patterns).toContain("none");
      expect(patterns).toContain("pulse");
      expect(patterns).toContain("wave");
    });

    it("should be type-compatible with AnimationPatternType", () => {
      const pattern: AnimationPattern = "pulse";
      expect(pattern).toBe("pulse");
    });

    it("should support all animation effects", () => {
      const none: AnimationPattern = "none";
      const pulse: AnimationPattern = "pulse";
      const wave: AnimationPattern = "wave";
      const scanline: AnimationPattern = "scanline";
      const shimmer: AnimationPattern = "shimmer";
      const drift: AnimationPattern = "drift";
      const colorCycle: AnimationPattern = "color_cycle";
      
      expect(none).toBe("none");
      expect(pulse).toBe("pulse");
      expect(wave).toBe("wave");
      expect(scanline).toBe("scanline");
      expect(shimmer).toBe("shimmer");
      expect(drift).toBe("drift");
      expect(colorCycle).toBe("color_cycle");
    });
  });
});
