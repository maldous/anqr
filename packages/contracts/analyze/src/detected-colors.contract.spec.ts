import { describe, it, expect } from "vitest";
import type { DetectedColors } from "./detected-colors.contract";

describe("contracts/analyze/detected-colors", () => {
  describe("DetectedColors", () => {
    it("accepts valid detected colors with high contrast", () => {
      const colors: DetectedColors = {
        foreground: "#000000",
        background: "#ffffff",
        contrastRatio: 21,
      };
      expect(colors.foreground).toBe("#000000");
      expect(colors.background).toBe("#ffffff");
      expect(colors.contrastRatio).toBe(21);
    });

    it("accepts medium contrast colors", () => {
      const colors: DetectedColors = {
        foreground: "#555555",
        background: "#eeeeee",
        contrastRatio: 7.5,
      };
      expect(colors.contrastRatio).toBeCloseTo(7.5);
    });

    it("accepts low contrast colors", () => {
      const colors: DetectedColors = {
        foreground: "#aaaaaa",
        background: "#bbbbbb",
        contrastRatio: 1.2,
      };
      expect(colors.contrastRatio).toBeGreaterThan(1);
    });

    it("accepts inverted colors (light foreground, dark background)", () => {
      const colors: DetectedColors = {
        foreground: "#ffffff",
        background: "#000000",
        contrastRatio: 21,
      };
      expect(colors.contrastRatio).toBe(21);
    });

    it("accepts colors without # prefix", () => {
      const colors: DetectedColors = {
        foreground: "1a1a1a",
        background: "f0f0f0",
        contrastRatio: 12.5,
      };
      expect(colors.foreground).toBe("1a1a1a");
    });
  });
});
