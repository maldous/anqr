import { describe, it, expect } from "vitest";
import type { CropRegion } from "./crop-region.contract";

describe("crop-region.contract", () => {
  describe("CropRegion interface", () => {
    it("should accept valid crop region", () => {
      const region: CropRegion = {
        x: 0.25,
        y: 0.25,
        size: 0.5,
      };
      expect(region.x).toBe(0.25);
      expect(region.y).toBe(0.25);
      expect(region.size).toBe(0.5);
    });

    it("should support full image crop", () => {
      const fullRegion: CropRegion = {
        x: 0,
        y: 0,
        size: 1,
      };
      expect(fullRegion.x).toBe(0);
      expect(fullRegion.y).toBe(0);
      expect(fullRegion.size).toBe(1);
    });

    it("should support various crop positions", () => {
      const topLeft: CropRegion = { x: 0, y: 0, size: 0.5 };
      const center: CropRegion = { x: 0.25, y: 0.25, size: 0.5 };
      const bottomRight: CropRegion = { x: 0.5, y: 0.5, size: 0.5 };
      
      expect(topLeft.x).toBe(0);
      expect(center.x).toBe(0.25);
      expect(bottomRight.x).toBe(0.5);
    });
  });
});
