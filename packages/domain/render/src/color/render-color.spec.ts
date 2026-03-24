import { describe, it, expect } from "vitest";
import { rgbToHex } from "./rgb-to-hex";
import { rgbaToHex } from "./rgba-to-hex";
import { rgbToString } from "./rgb-to-string";
import { rgbaToString } from "./rgba-to-string";
import { rgbToGray } from "./rgb-to-gray";
import { srgbToLinear01 } from "./srgb-to-linear01";
import { linearToSrgb8 } from "./linear-to-srgb8";
import { rgbToLumaLinear } from "./rgb-to-luma-linear";
import { resolveHslHue } from "./resolve-hsl-hue";
import { validateColor } from "./validate-color";
import { NAMED_COLORS } from "./named-colors";

describe("domain/render/color", () => {
  describe("rgbToHex", () => {
    it("converts black to #000000", () => {
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
    });

    it("converts white to #ffffff", () => {
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    });

    it("converts primary red to #ff0000", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    });

    it("pads single-digit hex values with zero", () => {
      expect(rgbToHex(1, 2, 3)).toBe("#010203");
    });

    it("rounds fractional values", () => {
      expect(rgbToHex(127.6, 0, 0)).toBe("#800000");
    });
  });

  describe("rgbaToHex", () => {
    it("converts fully opaque RGBA to 8-char hex", () => {
      expect(rgbaToHex(255, 0, 0, 1)).toBe("#ff0000ff");
    });

    it("defaults alpha to 1", () => {
      expect(rgbaToHex(0, 255, 0)).toBe("#00ff00ff");
    });

    it("converts half-transparent white", () => {
      expect(rgbaToHex(255, 255, 255, 0.5)).toBe("#ffffff80");
    });

    it("converts fully transparent black", () => {
      expect(rgbaToHex(0, 0, 0, 0)).toBe("#00000000");
    });

    it("clamps values to 0-255", () => {
      expect(rgbaToHex(300, -10, 128, 1)).toBe("#ff0080ff");
    });
  });

  describe("rgbToString", () => {
    it("formats as rgb() string", () => {
      expect(rgbToString(255, 128, 0)).toBe("rgb(255, 128, 0)");
    });

    it("formats black", () => {
      expect(rgbToString(0, 0, 0)).toBe("rgb(0, 0, 0)");
    });
  });

  describe("rgbaToString", () => {
    it("formats as rgba() string with alpha", () => {
      expect(rgbaToString(255, 128, 0, 0.5)).toBe("rgba(255, 128, 0, 0.5)");
    });

    it("rounds RGB values", () => {
      expect(rgbaToString(127.6, 0.4, 255.9, 1)).toBe("rgba(128, 0, 256, 1)");
    });
  });

  describe("rgbToGray", () => {
    it("returns 0 for black", () => {
      expect(rgbToGray(0, 0, 0)).toBe(0);
    });

    it("returns ~255 for white", () => {
      const gray = rgbToGray(255, 255, 255);
      expect(gray).toBeCloseTo(255, 0);
    });

    it("uses BT.601 luminance weights (0.299, 0.587, 0.114)", () => {
      expect(rgbToGray(100, 0, 0)).toBeCloseTo(29.9, 1);
      expect(rgbToGray(0, 100, 0)).toBeCloseTo(58.7, 1);
      expect(rgbToGray(0, 0, 100)).toBeCloseTo(11.4, 1);
    });

    it("green contributes the most to perceived brightness", () => {
      const red = rgbToGray(255, 0, 0);
      const green = rgbToGray(0, 255, 0);
      const blue = rgbToGray(0, 0, 255);
      expect(green).toBeGreaterThan(red);
      expect(red).toBeGreaterThan(blue);
    });
  });

  describe("srgbToLinear01", () => {
    it("returns 0 for channel 0", () => {
      expect(srgbToLinear01(0)).toBe(0);
    });

    it("returns 1 for channel 255", () => {
      expect(srgbToLinear01(255)).toBeCloseTo(1, 5);
    });

    it("converts low values below 0.04045 threshold linearly", () => {
      const result = srgbToLinear01(10);
      expect(result).toBeCloseTo(10 / 255 / 12.92, 5);
    });

    it("applies gamma correction for higher values", () => {
      const result = srgbToLinear01(128);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
      expect(result).toBeLessThan(128 / 255);
    });

    it("clamps negative values to 0", () => {
      expect(srgbToLinear01(-10)).toBe(0);
    });

    it("clamps values above 255 to 1", () => {
      expect(srgbToLinear01(300)).toBeCloseTo(1, 5);
    });

    it("is monotonically increasing from 0 to 255", () => {
      let prev = srgbToLinear01(0);
      for (let i = 1; i <= 255; i++) {
        const curr = srgbToLinear01(i);
        expect(curr).toBeGreaterThanOrEqual(prev);
        prev = curr;
      }
    });
  });

  describe("linearToSrgb8", () => {
    it("returns 0 for linear 0", () => {
      expect(linearToSrgb8(0)).toBe(0);
    });

    it("returns 255 for linear 1", () => {
      expect(linearToSrgb8(1)).toBe(255);
    });

    it("returns midpoint brightness above 128", () => {
      const result = linearToSrgb8(0.5);
      expect(result).toBeGreaterThan(128);
    });

    it("clamps negative input to 0", () => {
      expect(linearToSrgb8(-0.5)).toBe(0);
    });

    it("clamps input above 1 to 255", () => {
      expect(linearToSrgb8(1.5)).toBe(255);
    });

    it("round-trips with srgbToLinear01 for all 256 values", () => {
      for (let i = 0; i <= 255; i++) {
        const linear = srgbToLinear01(i);
        const back = linearToSrgb8(linear);
        expect(Math.abs(back - i)).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("rgbToLumaLinear", () => {
    it("returns 0 for black", () => {
      expect(rgbToLumaLinear(0, 0, 0)).toBe(0);
    });

    it("returns ~1 for white", () => {
      expect(rgbToLumaLinear(255, 255, 255)).toBeCloseTo(1, 2);
    });

    it("uses ITU-R BT.709 weights (0.2126, 0.7152, 0.0722)", () => {
      const green = rgbToLumaLinear(0, 255, 0);
      const red = rgbToLumaLinear(255, 0, 0);
      const blue = rgbToLumaLinear(0, 0, 255);
      expect(green).toBeGreaterThan(red);
      expect(red).toBeGreaterThan(blue);
    });

    it("returns values in [0, 1]", () => {
      for (let i = 0; i <= 255; i += 51) {
        const luma = rgbToLumaLinear(i, i, i);
        expect(luma).toBeGreaterThanOrEqual(0);
        expect(luma).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("resolveHslHue", () => {
    it("returns hue for red-dominant color", () => {
      const hue = resolveHslHue(200, 200, 100, 50, 150);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(1);
    });

    it("returns hue for green-dominant color", () => {
      const hue = resolveHslHue(200, 100, 200, 50, 150);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(1);
    });

    it("returns hue for blue-dominant color (default case)", () => {
      const hue = resolveHslHue(200, 50, 100, 200, 150);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(1);
    });

    it("wraps negative hue when green < blue in red case", () => {
      const hue = resolveHslHue(200, 200, 50, 100, 150);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(1);
    });
  });

  describe("validateColor", () => {
    it("accepts valid hex colors", () => {
      expect(validateColor("#ff0000", "black")).toBe("#ff0000");
      expect(validateColor("#abc", "black")).toBe("#abc");
      expect(validateColor("#aabbccdd", "black")).toBe("#aabbccdd");
    });

    it("accepts rgb() strings", () => {
      expect(validateColor("rgb(255, 0, 0)", "black")).toBe("rgb(255, 0, 0)");
    });

    it("accepts hsl() strings", () => {
      expect(validateColor("hsl(0, 100%, 50%)", "black")).toBe("hsl(0, 100%, 50%)");
    });

    it("accepts named colors", () => {
      expect(validateColor("red", "black")).toBe("black");
      expect(validateColor("blue", "black")).toBe("blue");
      expect(validateColor("green", "black")).toBe("green");
    });

    it("returns fallback for non-string input", () => {
      expect(validateColor(null, "black")).toBe("black");
      expect(validateColor(undefined, "black")).toBe("black");
      expect(validateColor(123, "black")).toBe("black");
    });

    it("returns fallback for empty string", () => {
      expect(validateColor("", "black")).toBe("black");
    });

    it("returns fallback for too-short strings", () => {
      expect(validateColor("ab", "black")).toBe("black");
      expect(validateColor("#a", "black")).toBe("black");
    });

    it("returns fallback for invalid hex", () => {
      expect(validateColor("#xyz", "black")).toBe("black");
      expect(validateColor("#gggggg", "black")).toBe("black");
    });

    it("returns fallback for strings with invalid characters", () => {
      expect(validateColor("re d", "black")).toBe("black");
      expect(validateColor("123abc", "black")).toBe("black");
    });
  });

  describe("NAMED_COLORS", () => {
    it("contains standard web colors", () => {
      expect(NAMED_COLORS.black).toBe("#000000");
      expect(NAMED_COLORS.white).toBe("#ffffff");
      expect(NAMED_COLORS.red).toBe("#ff0000");
      expect(NAMED_COLORS.green).toBe("#008000");
      expect(NAMED_COLORS.blue).toBe("#0000ff");
    });

    it("maps both gray and grey", () => {
      expect(NAMED_COLORS.gray).toBe("#808080");
      expect(NAMED_COLORS.grey).toBe("#808080");
    });

    it("includes transparent", () => {
      expect(NAMED_COLORS.transparent).toBe("#00000000");
    });

    it("has at least 20 named colors", () => {
      expect(Object.keys(NAMED_COLORS).length).toBeGreaterThanOrEqual(20);
    });

    it("all values are hex strings", () => {
      for (const [, value] of Object.entries(NAMED_COLORS)) {
        expect(value).toMatch(/^#[0-9a-f]{6,8}$/);
      }
    });
  });
});
