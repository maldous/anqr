import { describe, it, expect } from "vitest";
import type { RGBWithMeta } from "./rgb-with-meta.contract";

describe("rgb-with-meta.contract", () => {
  describe("RGBWithMeta interface", () => {
    it("should extend RGB with optional metadata", () => {
      const color: RGBWithMeta = {
        r: 255,
        g: 128,
        b: 64,
      };
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(64);
      expect(color.halftone).toBeUndefined();
      expect(color.sizeRatio).toBeUndefined();
    });

    it("should support halftone metadata", () => {
      const colorWithHalftone: RGBWithMeta = {
        r: 100,
        g: 150,
        b: 200,
        halftone: true,
      };
      expect(colorWithHalftone.halftone).toBe(true);
    });

    it("should support sizeRatio metadata", () => {
      const colorWithSizeRatio: RGBWithMeta = {
        r: 50,
        g: 100,
        b: 150,
        sizeRatio: 0.75,
      };
      expect(colorWithSizeRatio.sizeRatio).toBe(0.75);
    });

    it("should support both halftone and sizeRatio metadata", () => {
      const colorWithBoth: RGBWithMeta = {
        r: 0,
        g: 0,
        b: 0,
        halftone: true,
        sizeRatio: 1.5,
      };
      expect(colorWithBoth.halftone).toBe(true);
      expect(colorWithBoth.sizeRatio).toBe(1.5);
    });
  });
});
