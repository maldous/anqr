import { describe, it, expect } from "vitest";
import type { HSL } from "./hsl.contract";

describe("contracts/generator/hsl", () => {
  describe("HSL", () => {
    it("accepts valid HSL color", () => {
      const hsl: HSL = {
        h: 180,
        s: 50,
        l: 50,
      };
      expect(hsl.h).toBe(180);
      expect(hsl.s).toBe(50);
      expect(hsl.l).toBe(50);
    });

    it("accepts hue range 0-360", () => {
      const hsl0: HSL = { h: 0, s: 50, l: 50 };
      const hsl360: HSL = { h: 360, s: 50, l: 50 };
      expect(hsl0.h).toBe(0);
      expect(hsl360.h).toBe(360);
    });

    it("accepts saturation range 0-100", () => {
      const hsl0: HSL = { h: 180, s: 0, l: 50 };
      const hsl100: HSL = { h: 180, s: 100, l: 50 };
      expect(hsl0.s).toBe(0);
      expect(hsl100.s).toBe(100);
    });

    it("accepts lightness range 0-100", () => {
      const hsl0: HSL = { h: 180, s: 50, l: 0 };
      const hsl100: HSL = { h: 180, s: 50, l: 100 };
      expect(hsl0.l).toBe(0);
      expect(hsl100.l).toBe(100);
    });

    it("accepts pure red (h=0)", () => {
      const red: HSL = { h: 0, s: 100, l: 50 };
      expect(red.h).toBe(0);
    });

    it("accepts pure green (h=120)", () => {
      const green: HSL = { h: 120, s: 100, l: 50 };
      expect(green.h).toBe(120);
    });

    it("accepts pure blue (h=240)", () => {
      const blue: HSL = { h: 240, s: 100, l: 50 };
      expect(blue.h).toBe(240);
    });

    it("accepts grayscale (s=0)", () => {
      const gray: HSL = { h: 0, s: 0, l: 50 };
      expect(gray.s).toBe(0);
    });
  });
});
