import { describe, it, expect } from "vitest";
import { getGradientColor } from "./color/get-gradient-color";
import { getGradientColorAt } from "./color/get-gradient-color-at";
import { createCssGradient } from "./color/create-css-gradient";
import { getAnalogous } from "./color/get-analogous";
import { getTriadic } from "./color/get-triadic";
import { getRelatedHues } from "./color/get-related-hues";
import { blendColorsLinear } from "./color/blend-colors-linear";
import { blendRgbLinear } from "./color/blend-rgb-linear";
import { blendRgb } from "./color/blend-rgb";
import { rgbToHslTuple } from "./color/rgb-to-hsl-tuple";
import { hslToRgbTuple } from "./color/hsl-to-rgb-tuple";
import { parseRgbString } from "./color/parse-rgb-string";
import { parseHslString } from "./color/parse-hsl-string";

describe("domain/render/color (harmony & gradients)", () => {
  // ── getGradientColor ───────────────────────────────────────

  describe("getGradientColor", () => {
    it("returns black for empty stops", () => {
      expect(getGradientColor({ type: "linear", stops: [] }, 0.5)).toEqual({
        r: 0,
        g: 0,
        b: 0,
      });
    });

    it("returns the single stop color", () => {
      const result = getGradientColor(
        { type: "linear", stops: [{ color: "#ff0000", pos: 0 }] },
        0.5,
      );
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it("interpolates between two stops at midpoint", () => {
      const result = getGradientColor(
        {
          type: "linear",
          stops: [
            { color: "#000000", pos: 0 },
            { color: "#ffffff", pos: 1 },
          ],
        },
        0.5,
      );
      expect(result.r).toBeCloseTo(128, -1);
      expect(result.g).toBeCloseTo(128, -1);
      expect(result.b).toBeCloseTo(128, -1);
    });

    it("returns first stop color at position 0", () => {
      const result = getGradientColor(
        {
          type: "linear",
          stops: [
            { color: "#ff0000", pos: 0 },
            { color: "#0000ff", pos: 1 },
          ],
        },
        0,
      );
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("returns last stop color at position 1", () => {
      const result = getGradientColor(
        {
          type: "linear",
          stops: [
            { color: "#ff0000", pos: 0 },
            { color: "#0000ff", pos: 1 },
          ],
        },
        1,
      );
      expect(result).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("handles unsorted stops", () => {
      const result = getGradientColor(
        {
          type: "linear",
          stops: [
            { color: "#0000ff", pos: 1 },
            { color: "#ff0000", pos: 0 },
          ],
        },
        0,
      );
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  // ── getGradientColorAt ─────────────────────────────────────

  describe("getGradientColorAt", () => {
    it("delegates to getGradientColor with linear type", () => {
      const result = getGradientColorAt(
        [
          { color: "#ff0000", pos: 0 },
          { color: "#0000ff", pos: 1 },
        ],
        0,
      );
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("returns interpolated color at midpoint", () => {
      const result = getGradientColorAt(
        [
          { color: "#000000", pos: 0 },
          { color: "#ffffff", pos: 1 },
        ],
        0.5,
      );
      expect(result.r).toBeCloseTo(128, -1);
    });
  });

  // ── createCssGradient ──────────────────────────────────────

  describe("createCssGradient", () => {
    it("returns transparent for type none", () => {
      expect(createCssGradient({ type: "none", stops: [] })).toBe("transparent");
    });

    it("returns transparent for empty stops", () => {
      expect(createCssGradient({ type: "linear", stops: [] })).toBe("transparent");
    });

    it("generates linear-gradient", () => {
      const result = createCssGradient({
        type: "linear",
        angle: 90,
        stops: [
          { color: "#ff0000", pos: 0 },
          { color: "#0000ff", pos: 1 },
        ],
      });
      expect(result).toBe("linear-gradient(90deg, #ff0000 0%, #0000ff 100%)");
    });

    it("defaults angle to 0 for linear", () => {
      const result = createCssGradient({
        type: "linear",
        stops: [{ color: "red", pos: 0 }],
      });
      expect(result).toContain("0deg");
    });

    it("generates radial-gradient", () => {
      const result = createCssGradient({
        type: "radial",
        stops: [
          { color: "#fff", pos: 0 },
          { color: "#000", pos: 1 },
        ],
      });
      expect(result).toMatch(/^radial-gradient\(circle,/);
    });

    it("generates conic-gradient", () => {
      const result = createCssGradient({
        type: "conic",
        angle: 45,
        stops: [
          { color: "red", pos: 0 },
          { color: "blue", pos: 1 },
        ],
      });
      expect(result).toMatch(/^conic-gradient\(from 45deg,/);
    });
  });

  // ── getRelatedHues ─────────────────────────────────────────

  describe("getRelatedHues", () => {
    it("returns two shifted hue colors", () => {
      const [c1, c2] = getRelatedHues("#ff0000", [120, 240]);
      expect(c1).toMatch(/^rgb\(/);
      expect(c2).toMatch(/^rgb\(/);
    });

    it("returns original color twice for invalid input", () => {
      const [c1, c2] = getRelatedHues("not-a-color", [30, -30]);
      expect(c1).toBe("not-a-color");
      expect(c2).toBe("not-a-color");
    });

    it("wraps hues around 360", () => {
      const [c1, c2] = getRelatedHues("#ff0000", [350, -350]);
      expect(c1).toMatch(/^rgb\(/);
      expect(c2).toMatch(/^rgb\(/);
    });
  });

  // ── getAnalogous ───────────────────────────────────────────

  describe("getAnalogous", () => {
    it("returns two analogous colors", () => {
      const [c1, c2] = getAnalogous("#ff0000");
      expect(c1).toMatch(/^rgb\(/);
      expect(c2).toMatch(/^rgb\(/);
    });

    it("uses default 30 degree angle", () => {
      const result1 = getAnalogous("#ff0000");
      const result2 = getAnalogous("#ff0000", 30);
      expect(result1).toEqual(result2);
    });

    it("accepts custom angle", () => {
      const result = getAnalogous("#ff0000", 60);
      expect(result[0]).toMatch(/^rgb\(/);
      expect(result[1]).toMatch(/^rgb\(/);
    });
  });

  // ── getTriadic ─────────────────────────────────────────────

  describe("getTriadic", () => {
    it("returns two triadic colors", () => {
      const [c1, c2] = getTriadic("#ff0000");
      expect(c1).toMatch(/^rgb\(/);
      expect(c2).toMatch(/^rgb\(/);
    });

    it("produces distinct colors from input", () => {
      const [c1, c2] = getTriadic("#ff0000");
      expect(c1).not.toBe(c2);
    });
  });

  // ── blendRgb ───────────────────────────────────────────────

  describe("blendRgb", () => {
    it("returns first color at ratio 0", () => {
      expect(blendRgb({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 0)).toEqual({
        r: 255,
        g: 0,
        b: 0,
      });
    });

    it("returns second color at ratio 1", () => {
      expect(blendRgb({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 1)).toEqual({
        r: 0,
        g: 0,
        b: 255,
      });
    });

    it("blends at midpoint", () => {
      const result = blendRgb({ r: 0, g: 0, b: 0 }, { r: 200, g: 100, b: 50 }, 0.5);
      expect(result).toEqual({ r: 100, g: 50, b: 25 });
    });
  });

  // ── blendRgbLinear ─────────────────────────────────────────

  describe("blendRgbLinear", () => {
    it("returns first color at ratio 0", () => {
      const result = blendRgbLinear({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 0);
      expect(result.r).toBe(255);
      expect(result.b).toBe(0);
    });

    it("returns second color at ratio 1", () => {
      const result = blendRgbLinear({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 1);
      expect(result.r).toBe(0);
      expect(result.b).toBe(255);
    });

    it("clamps ratio below 0", () => {
      const result = blendRgbLinear({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, -0.5);
      expect(result.r).toBe(255);
    });

    it("clamps ratio above 1", () => {
      const result = blendRgbLinear({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 1.5);
      expect(result.b).toBe(255);
    });
  });

  // ── blendColorsLinear ──────────────────────────────────────

  describe("blendColorsLinear", () => {
    it("returns hex string for opaque result", () => {
      const result = blendColorsLinear("#ff0000", "#0000ff", 0);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("returns first color at ratio 0", () => {
      expect(blendColorsLinear("#ff0000", "#0000ff", 0)).toBe("#ff0000");
    });

    it("returns second color at ratio 1", () => {
      expect(blendColorsLinear("#ff0000", "#0000ff", 1)).toBe("#0000ff");
    });

    it("clamps ratio to [0,1]", () => {
      expect(blendColorsLinear("#ff0000", "#0000ff", -1)).toBe("#ff0000");
      expect(blendColorsLinear("#ff0000", "#0000ff", 2)).toBe("#0000ff");
    });
  });

  // ── rgbToHslTuple ──────────────────────────────────────────

  describe("rgbToHslTuple", () => {
    it("converts pure red", () => {
      const [h, s, l] = rgbToHslTuple(255, 0, 0);
      expect(h).toBeCloseTo(0, 0);
      expect(s).toBeGreaterThan(90);
      expect(l).toBeCloseTo(50, 0);
    });

    it("converts pure green", () => {
      const [h] = rgbToHslTuple(0, 255, 0);
      expect(h).toBeCloseTo(120, 0);
    });

    it("converts pure blue", () => {
      const [h] = rgbToHslTuple(0, 0, 255);
      expect(h).toBeCloseTo(240, 0);
    });

    it("converts white to zero saturation", () => {
      const [, s, l] = rgbToHslTuple(255, 255, 255);
      expect(s).toBe(0);
      expect(l).toBe(100);
    });

    it("converts black", () => {
      const [, s, l] = rgbToHslTuple(0, 0, 0);
      expect(s).toBe(0);
      expect(l).toBe(0);
    });
  });

  // ── hslToRgbTuple ──────────────────────────────────────────

  describe("hslToRgbTuple", () => {
    it("converts pure red HSL", () => {
      const [r, g, b] = hslToRgbTuple(0, 100, 50);
      expect(r).toBe(255);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });

    it("converts pure green HSL", () => {
      const [r, g, b] = hslToRgbTuple(120, 100, 50);
      expect(r).toBe(0);
      expect(g).toBe(255);
      expect(b).toBe(0);
    });

    it("converts white HSL", () => {
      const [r, g, b] = hslToRgbTuple(0, 0, 100);
      expect(r).toBe(255);
      expect(g).toBe(255);
      expect(b).toBe(255);
    });

    it("converts black HSL", () => {
      const [r, g, b] = hslToRgbTuple(0, 0, 0);
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBe(0);
    });
  });

  // ── parseRgbString ─────────────────────────────────────────

  describe("parseRgbString", () => {
    it("parses rgb() string", () => {
      expect(parseRgbString("rgb(255, 128, 0)")).toEqual({ r: 255, g: 128, b: 0, a: 1 });
    });

    it("parses rgba() string", () => {
      expect(parseRgbString("rgba(255, 128, 0, 0.5)")).toEqual({
        r: 255,
        g: 128,
        b: 0,
        a: 0.5,
      });
    });

    it("defaults alpha to 1 for rgb()", () => {
      expect(parseRgbString("rgb(10, 20, 30)").a).toBe(1);
    });

    it("returns black for invalid input", () => {
      expect(parseRgbString("not-a-color")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });
  });

  // ── parseHslString ─────────────────────────────────────────

  describe("parseHslString", () => {
    it("parses hsl() string", () => {
      expect(parseHslString("hsl(180, 50%, 60%)")).toEqual({ h: 180, s: 50, l: 60, a: 1 });
    });

    it("parses hsla() string", () => {
      expect(parseHslString("hsla(180, 50%, 60%, 0.8)")).toEqual({
        h: 180,
        s: 50,
        l: 60,
        a: 0.8,
      });
    });

    it("defaults alpha to 1 for hsl()", () => {
      expect(parseHslString("hsl(0, 0%, 0%)").a).toBe(1);
    });

    it("returns zeros for invalid input", () => {
      expect(parseHslString("not-a-color")).toEqual({ h: 0, s: 0, l: 0, a: 1 });
    });
  });
});
