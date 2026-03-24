import { describe, it, expect } from "vitest";
import type { StructuralAnalysis } from "./structural-analysis.contract";

describe("contracts/analyze/structural-analysis", () => {
  describe("StructuralAnalysis", () => {
    it("accepts valid QR code with all patterns", () => {
      const analysis: StructuralAnalysis = {
        hasFinderPatterns: true,
        hasTimingPatterns: true,
        hasAlignmentPatterns: true,
        alignmentPatternCount: 1,
      };
      expect(analysis.hasFinderPatterns).toBe(true);
      expect(analysis.alignmentPatternCount).toBe(1);
    });

    it("accepts QR code without alignment patterns (version 1)", () => {
      const analysis: StructuralAnalysis = {
        hasFinderPatterns: true,
        hasTimingPatterns: true,
        hasAlignmentPatterns: false,
        alignmentPatternCount: 0,
      };
      expect(analysis.alignmentPatternCount).toBe(0);
    });

    it("accepts QR code with multiple alignment patterns", () => {
      const analysis: StructuralAnalysis = {
        hasFinderPatterns: true,
        hasTimingPatterns: true,
        hasAlignmentPatterns: true,
        alignmentPatternCount: 25,
      };
      expect(analysis.alignmentPatternCount).toBe(25);
    });

    it("accepts incomplete QR structure", () => {
      const analysis: StructuralAnalysis = {
        hasFinderPatterns: false,
        hasTimingPatterns: false,
        hasAlignmentPatterns: false,
        alignmentPatternCount: 0,
      };
      expect(analysis.hasFinderPatterns).toBe(false);
    });
  });
});
