import { describe, it, expect } from "vitest";
import { parseHex } from "./color/parse-hex";
import { parseHexAlpha } from "./color/parse-hex-alpha";
import { rgbToHsl } from "./color/rgb-to-hsl";
import { hslToRgb } from "./color/hsl-to-rgb";
import { parseColor } from "./color/parse-color";
import { getRelativeLuminance } from "./color/get-relative-luminance";
import { getContrastRatio } from "./color/get-contrast-ratio";
import { isDark } from "./color/is-dark";
import { getTextColor } from "./color/get-text-color";
import { alphaBlend } from "./color/alpha-blend";
import { blendColors } from "./color/blend-colors";
import { multiplyBlend } from "./color/multiply-blend";
import { screenBlend } from "./color/screen-blend";
import { overlayBlend } from "./color/overlay-blend";
import { getComplementary } from "./color/get-complementary";
import { meetsContrastAA } from "./color/meets-contrast-aa";
import { meetsContrastAAA } from "./color/meets-contrast-aaa";
import { adjustForContrast } from "./color/adjust-for-contrast";

describe("domain/render/color (extended)", () => {
  // ── parseHex ───────────────────────────────────────────────────

  describe("parseHex", () => {
    it("parses 6-char hex with #", () => {
      expect(parseHex("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("parses 6-char hex without #", () => {
      expect(parseHex("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    });

    it("expands 3-char shorthand", () => {
      expect(parseHex("#fab")).toEqual({ r: 255, g: 170, b: 187 });
    });

    it("parses black", () => {
      expect(parseHex("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("parses white", () => {
      expect(parseHex("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  // ── parseHexAlpha ──────────────────────────────────────────────

  describe("parseHexAlpha", () => {
    it("parses 8-char hex with alpha", () => {
      const result = parseHexAlpha("#ff000080");
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBeCloseTo(128 / 255, 2);
    });

    it("defaults alpha to 1 for 6-char hex", () => {
      const result = parseHexAlpha("#00ff00");
      expect(result.a).toBe(1);
      expect(result.g).toBe(255);
    });

    it("expands 4-char shorthand with alpha", () => {
      const result = parseHexAlpha("#f008");
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBeCloseTo(0x88 / 255, 2);
    });

    it("parses fully transparent black", () => {
      const result = parseHexAlpha("#00000000");
      expect(result.r).toBe(0);
      expect(result.a).toBeCloseTo(0, 2);
    });

    it("parses fully opaque white", () => {
      const result = parseHexAlpha("#ffffffff");
      expect(result.r).toBe(255);
      expect(result.a).toBeCloseTo(1, 2);
    });
  });

  // ── rgbToHsl ───────────────────────────────────────────────────

  describe("rgbToHsl", () => {
    it("converts black to hsl(0, 0, 0)", () => {
      const hsl = rgbToHsl(0, 0, 0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(0);
    });

    it("converts white to hsl(0, 0, 100)", () => {
      const hsl = rgbToHsl(255, 255, 255);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(100);
    });

    it("converts pure red to hsl(0, 100, 50)", () => {
      const hsl = rgbToHsl(255, 0, 0);
      expect(hsl.h).toBeCloseTo(0, 0);
      expect(hsl.s).toBeCloseTo(100, 0);
      expect(hsl.l).toBeCloseTo(50, 0);
    });

    it("converts pure green to hsl(120, 100, ~50)", () => {
      const hsl = rgbToHsl(0, 255, 0);
      expect(hsl.h).toBeCloseTo(120, 0);
      expect(hsl.s).toBeCloseTo(100, 0);
    });

    it("converts mid gray to zero saturation", () => {
      const hsl = rgbToHsl(128, 128, 128);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBeCloseTo(50, 0);
    });
  });

  // ── hslToRgb ───────────────────────────────────────────────────

  describe("hslToRgb", () => {
    it("converts black", () => {
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("converts white", () => {
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("converts pure red", () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("converts achromatic (saturation=0)", () => {
      const rgb = hslToRgb(180, 0, 50);
      expect(rgb.r).toBe(rgb.g);
      expect(rgb.g).toBe(rgb.b);
      expect(rgb.r).toBeCloseTo(128, 0);
    });

    it("round-trips with rgbToHsl for primary colors", () => {
      const hsl = rgbToHsl(0, 0, 255);
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      expect(rgb.r).toBeCloseTo(0, 0);
      expect(rgb.g).toBeCloseTo(0, 0);
      expect(rgb.b).toBeCloseTo(255, 0);
    });
  });

  // ── parseColor ─────────────────────────────────────────────────

  describe("parseColor", () => {
    it("parses hex color", () => {
      const result = parseColor("#ff0000");
      expect(result).not.toBeNull();
      expect(result!.r).toBe(255);
      expect(result!.g).toBe(0);
    });

    it("parses rgb() string", () => {
      const result = parseColor("rgb(100, 200, 50)");
      expect(result).not.toBeNull();
      expect(result!.r).toBe(100);
      expect(result!.g).toBe(200);
      expect(result!.b).toBe(50);
    });

    it("parses hsl() string", () => {
      const result = parseColor("hsl(0, 100%, 50%)");
      expect(result).not.toBeNull();
      expect(result!.r).toBeCloseTo(255, 0);
    });

    it("parses named color", () => {
      const result = parseColor("blue");
      expect(result).not.toBeNull();
      expect(result!.r).toBe(0);
      expect(result!.b).toBe(255);
    });

    it("returns null for invalid color", () => {
      expect(parseColor("not-a-color-123")).toBeNull();
    });

    it("trims and lowercases input", () => {
      const result = parseColor("  #FF0000  ");
      expect(result).not.toBeNull();
      expect(result!.r).toBe(255);
    });
  });

  // ── getRelativeLuminance ───────────────────────────────────────

  describe("getRelativeLuminance", () => {
    it("returns 0 for black", () => {
      expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    });

    it("returns ~1 for white", () => {
      expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
    });

    it("accepts string input", () => {
      expect(getRelativeLuminance("#ffffff")).toBeCloseTo(1, 2);
    });

    it("returns value between 0 and 1", () => {
      const lum = getRelativeLuminance({ r: 128, g: 128, b: 128 });
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  // ── getContrastRatio ───────────────────────────────────────────

  describe("getContrastRatio", () => {
    it("returns 21 for black vs white", () => {
      expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    });

    it("returns 1 for same color", () => {
      expect(getContrastRatio("#808080", "#808080")).toBeCloseTo(1, 1);
    });

    it("is symmetric", () => {
      const ab = getContrastRatio("#ff0000", "#0000ff");
      const ba = getContrastRatio("#0000ff", "#ff0000");
      expect(ab).toBeCloseTo(ba, 5);
    });

    it("accepts RGB objects", () => {
      const ratio = getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  // ── isDark ─────────────────────────────────────────────────────

  describe("isDark", () => {
    it("returns true for black", () => {
      expect(isDark("#000000")).toBe(true);
    });

    it("returns false for white", () => {
      expect(isDark("#ffffff")).toBe(false);
    });

    it("accepts RGB object", () => {
      expect(isDark({ r: 0, g: 0, b: 0 })).toBe(true);
      expect(isDark({ r: 255, g: 255, b: 255 })).toBe(false);
    });

    it("returns false for invalid string", () => {
      expect(isDark("not-a-color")).toBe(false);
    });
  });

  // ── getTextColor ───────────────────────────────────────────────

  describe("getTextColor", () => {
    it("returns white text for dark background", () => {
      expect(getTextColor("#000000")).toBe("#ffffff");
    });

    it("returns black text for light background", () => {
      expect(getTextColor("#ffffff")).toBe("#000000");
    });

    it("accepts RGB object", () => {
      expect(getTextColor({ r: 0, g: 0, b: 0 })).toBe("#ffffff");
    });
  });

  // ── alphaBlend ─────────────────────────────────────────────────

  describe("alphaBlend", () => {
    it("returns top when fully opaque", () => {
      const result = alphaBlend({ r: 255, g: 0, b: 0, a: 1 }, { r: 0, g: 0, b: 255, a: 1 });
      expect(result.r).toBe(255);
      expect(result.b).toBe(0);
    });

    it("returns bottom when top is fully transparent", () => {
      const result = alphaBlend({ r: 255, g: 0, b: 0, a: 0 }, { r: 0, g: 255, b: 0, a: 1 });
      expect(result.g).toBe(255);
    });

    it("blends at half alpha", () => {
      const result = alphaBlend({ r: 255, g: 0, b: 0, a: 0.5 }, { r: 0, g: 0, b: 255, a: 1 });
      expect(result.r).toBeGreaterThan(0);
      expect(result.b).toBeGreaterThan(0);
    });

    it("returns transparent black when both are transparent", () => {
      const result = alphaBlend({ r: 255, g: 0, b: 0, a: 0 }, { r: 0, g: 255, b: 0, a: 0 });
      expect(result.a).toBe(0);
    });
  });

  // ── blendColors ────────────────────────────────────────────────

  describe("blendColors", () => {
    it("returns first color at ratio 0", () => {
      const result = blendColors("#ff0000", "#0000ff", 0);
      expect(result).toBe("#ff0000");
    });

    it("returns second color at ratio 1", () => {
      const result = blendColors("#ff0000", "#0000ff", 1);
      expect(result).toBe("#0000ff");
    });

    it("blends at ratio 0.5 to midpoint", () => {
      const result = blendColors("#000000", "#ffffff", 0.5);
      expect(result).toContain("80");
    });

    it("returns rgba string when blending semi-transparent colors", () => {
      const result = blendColors("#ff000080", "#0000ff80", 0.5);
      expect(result).toContain("rgba");
    });
  });

  // ── multiplyBlend ──────────────────────────────────────────────

  describe("multiplyBlend", () => {
    it("multiplying with white returns original color", () => {
      const result = multiplyBlend({ r: 128, g: 64, b: 32 }, { r: 255, g: 255, b: 255 });
      expect(result.r).toBe(128);
      expect(result.g).toBe(64);
      expect(result.b).toBe(32);
    });

    it("multiplying with black returns black", () => {
      const result = multiplyBlend({ r: 200, g: 100, b: 50 }, { r: 0, g: 0, b: 0 });
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("multiplies channel values", () => {
      const result = multiplyBlend({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(result.r).toBeCloseTo(64, 0);
    });
  });

  // ── screenBlend ────────────────────────────────────────────────

  describe("screenBlend", () => {
    it("screening with black returns original color", () => {
      const result = screenBlend({ r: 128, g: 64, b: 32 }, { r: 0, g: 0, b: 0 });
      expect(result.r).toBe(128);
      expect(result.g).toBe(64);
    });

    it("screening with white returns white", () => {
      const result = screenBlend({ r: 100, g: 100, b: 100 }, { r: 255, g: 255, b: 255 });
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("screen blends midtones brighter", () => {
      const result = screenBlend({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(result.r).toBeGreaterThan(128);
    });
  });

  // ── overlayBlend ───────────────────────────────────────────────

  describe("overlayBlend", () => {
    it("returns 0 when top channel is 0", () => {
      const result = overlayBlend({ r: 0, g: 0, b: 0 }, { r: 128, g: 128, b: 128 });
      expect(result.r).toBe(0);
    });

    it("uses multiply formula for dark bottom values", () => {
      const result = overlayBlend({ r: 128, g: 128, b: 128 }, { r: 64, g: 64, b: 64 });
      expect(result.r).toBeLessThan(128);
    });

    it("uses screen formula for light bottom values", () => {
      const result = overlayBlend({ r: 128, g: 128, b: 128 }, { r: 200, g: 200, b: 200 });
      expect(result.r).toBeGreaterThan(128);
    });
  });

  // ── getComplementary ───────────────────────────────────────────

  describe("getComplementary", () => {
    it("returns cyan-ish for red", () => {
      const result = getComplementary("#ff0000");
      expect(result).toContain("rgb");
      const parsed = parseColor(result);
      expect(parsed).not.toBeNull();
      expect(parsed!.r).toBeLessThan(10);
    });

    it("returns original for invalid color", () => {
      expect(getComplementary("invalid")).toBe("invalid");
    });

    it("shifts hue by 180 degrees", () => {
      const result = getComplementary("#0000ff");
      const parsed = parseColor(result);
      expect(parsed).not.toBeNull();
      expect(parsed!.b).toBeLessThan(10);
    });
  });

  // ── meetsContrastAA ────────────────────────────────────────────

  describe("meetsContrastAA", () => {
    it("passes for black on white (21:1)", () => {
      expect(meetsContrastAA("#000000", "#ffffff")).toBe(true);
    });

    it("fails for similar colors", () => {
      expect(meetsContrastAA("#808080", "#909090")).toBe(false);
    });

    it("returns false for invalid colors", () => {
      expect(meetsContrastAA("invalid", "#ffffff")).toBe(false);
    });
  });

  // ── meetsContrastAAA ───────────────────────────────────────────

  describe("meetsContrastAAA", () => {
    it("passes for black on white (21:1 > 7:1)", () => {
      expect(meetsContrastAAA("#000000", "#ffffff")).toBe(true);
    });

    it("fails for moderate contrast", () => {
      expect(meetsContrastAAA("#666666", "#ffffff")).toBe(false);
    });

    it("returns false for invalid colors", () => {
      expect(meetsContrastAAA("invalid", "also-invalid")).toBe(false);
    });
  });

  // ── adjustForContrast ──────────────────────────────────────────

  describe("adjustForContrast", () => {
    it("returns original when contrast already met", () => {
      expect(adjustForContrast("#000000", "#ffffff")).toBe("#000000");
    });

    it("adjusts foreground when contrast insufficient", () => {
      const result = adjustForContrast("#777777", "#888888");
      expect(result).not.toBe("#777777");
    });

    it("returns original for invalid colors", () => {
      expect(adjustForContrast("invalid", "#ffffff")).toBe("invalid");
    });

    it("returns original when target ratio is unachievable", () => {
      // Mid-gray bg makes 7:1 impossible — function returns original after exhausting attempts
      const result = adjustForContrast("#777777", "#888888", 7);
      expect(result).toBe("#777777");
    });
  });
});
