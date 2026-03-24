import { describe, it, expect } from "vitest";
import type { DominantColorInfo } from "./dominant-color-info.contract";

describe("contracts/analyze/dominant-color-info", () => {
  describe("DominantColorInfo", () => {
    it("accepts valid dominant color info", () => {
      const colorInfo: DominantColorInfo = {
        color: "#ff0000",
        percentage: 45.5,
        rgb: { r: 255, g: 0, b: 0 },
      };
      expect(colorInfo.color).toBe("#ff0000");
      expect(colorInfo.percentage).toBe(45.5);
      expect(colorInfo.rgb.r).toBe(255);
    });

    it("accepts color without # prefix", () => {
      const colorInfo: DominantColorInfo = {
        color: "00ff00",
        percentage: 30,
        rgb: { r: 0, g: 255, b: 0 },
      };
      expect(colorInfo.color).toBe("00ff00");
    });

    it("accepts 0% percentage", () => {
      const colorInfo: DominantColorInfo = {
        color: "#000000",
        percentage: 0,
        rgb: { r: 0, g: 0, b: 0 },
      };
      expect(colorInfo.percentage).toBe(0);
    });

    it("accepts 100% percentage", () => {
      const colorInfo: DominantColorInfo = {
        color: "#ffffff",
        percentage: 100,
        rgb: { r: 255, g: 255, b: 255 },
      };
      expect(colorInfo.percentage).toBe(100);
    });

    it("accepts grayscale color", () => {
      const colorInfo: DominantColorInfo = {
        color: "#808080",
        percentage: 50,
        rgb: { r: 128, g: 128, b: 128 },
      };
      expect(colorInfo.rgb.r).toBe(colorInfo.rgb.g);
      expect(colorInfo.rgb.g).toBe(colorInfo.rgb.b);
    });
  });
});
