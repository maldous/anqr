import { describe, it, expect } from "vitest";
import type { RGBA } from "./rgba.contract";

describe("contracts/generator/rgba", () => {
  describe("RGBA", () => {
    it("accepts valid RGBA color with full opacity", () => {
      const rgba: RGBA = {
        r: 255,
        g: 128,
        b: 0,
        a: 1,
      };
      expect(rgba.r).toBe(255);
      expect(rgba.g).toBe(128);
      expect(rgba.b).toBe(0);
      expect(rgba.a).toBe(1);
    });

    it("accepts RGBA color with zero opacity", () => {
      const rgba: RGBA = {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
      };
      expect(rgba.a).toBe(0);
    });

    it("accepts RGBA color with partial opacity", () => {
      const rgba: RGBA = {
        r: 100,
        g: 150,
        b: 200,
        a: 0.5,
      };
      expect(rgba.a).toBe(0.5);
    });

    it("extends RGB with alpha channel", () => {
      const rgba: RGBA = {
        r: 64,
        g: 128,
        b: 192,
        a: 0.75,
      };
      expect(rgba).toHaveProperty("r");
      expect(rgba).toHaveProperty("g");
      expect(rgba).toHaveProperty("b");
      expect(rgba).toHaveProperty("a");
    });

    it("accepts black with opacity", () => {
      const rgba: RGBA = { r: 0, g: 0, b: 0, a: 0.8 };
      expect(rgba.r).toBe(0);
      expect(rgba.a).toBe(0.8);
    });

    it("accepts white with opacity", () => {
      const rgba: RGBA = { r: 255, g: 255, b: 255, a: 0.9 };
      expect(rgba.r).toBe(255);
      expect(rgba.a).toBe(0.9);
    });
  });
});
