import { describe, it, expect } from "vitest";
import type { HSLA } from "./hsla.contract";

describe("contracts/generator/hsla", () => {
  describe("HSLA", () => {
    it("accepts valid HSLA color with full opacity", () => {
      const hsla: HSLA = {
        h: 180,
        s: 50,
        l: 50,
        a: 1,
      };
      expect(hsla.h).toBe(180);
      expect(hsla.s).toBe(50);
      expect(hsla.l).toBe(50);
      expect(hsla.a).toBe(1);
    });

    it("accepts HSLA color with zero opacity", () => {
      const hsla: HSLA = {
        h: 0,
        s: 0,
        l: 0,
        a: 0,
      };
      expect(hsla.a).toBe(0);
    });

    it("accepts HSLA color with partial opacity", () => {
      const hsla: HSLA = {
        h: 240,
        s: 100,
        l: 50,
        a: 0.5,
      };
      expect(hsla.a).toBe(0.5);
    });

    it("extends HSL with alpha channel", () => {
      const hsla: HSLA = {
        h: 120,
        s: 75,
        l: 60,
        a: 0.8,
      };
      expect(hsla).toHaveProperty("h");
      expect(hsla).toHaveProperty("s");
      expect(hsla).toHaveProperty("l");
      expect(hsla).toHaveProperty("a");
    });
  });
});
