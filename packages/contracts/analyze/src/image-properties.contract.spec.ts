import { describe, it, expect } from "vitest";
import type { ImageProperties } from "./image-properties.contract";

describe("contracts/analyze/image-properties", () => {
  describe("ImageProperties", () => {
    it("accepts valid image properties with all fields", () => {
      const props: ImageProperties = {
        width: 800,
        height: 600,
        aspectRatio: 4 / 3,
        estimatedQrSizePx: 400,
      };
      expect(props.width).toBe(800);
      expect(props.height).toBe(600);
      expect(props.aspectRatio).toBeCloseTo(1.333, 2);
      expect(props.estimatedQrSizePx).toBe(400);
    });

    it("accepts square image (aspect ratio 1:1)", () => {
      const props: ImageProperties = {
        width: 500,
        height: 500,
        aspectRatio: 1,
        estimatedQrSizePx: 500,
      };
      expect(props.aspectRatio).toBe(1);
    });

    it("accepts portrait image (aspect ratio < 1)", () => {
      const props: ImageProperties = {
        width: 600,
        height: 800,
        aspectRatio: 0.75,
        estimatedQrSizePx: 450,
      };
      expect(props.aspectRatio).toBe(0.75);
    });

    it("accepts landscape image (aspect ratio > 1)", () => {
      const props: ImageProperties = {
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        estimatedQrSizePx: 800,
      };
      expect(props.aspectRatio).toBeCloseTo(1.778, 2);
    });

    it("accepts very wide image", () => {
      const props: ImageProperties = {
        width: 3840,
        height: 1080,
        aspectRatio: 3840 / 1080,
        estimatedQrSizePx: 1000,
      };
      expect(props.aspectRatio).toBeCloseTo(3.556, 2);
    });

    it("accepts minimum size image", () => {
      const props: ImageProperties = {
        width: 50,
        height: 50,
        aspectRatio: 1,
        estimatedQrSizePx: 40,
      };
      expect(props.width).toBe(50);
    });

    it("accepts large image", () => {
      const props: ImageProperties = {
        width: 4096,
        height: 4096,
        aspectRatio: 1,
        estimatedQrSizePx: 3800,
      };
      expect(props.width).toBe(4096);
    });
  });
});
