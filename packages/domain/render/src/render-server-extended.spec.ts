import { describe, it, expect } from "vitest";
import { rgbToGrayServer } from "./server/rgb-to-gray-server";
import { adjustPixelColor } from "./server/adjust-pixel-color";
import { parseGifDisposalCode } from "./server/parse-gif-disposal-code";
import { parseGifBackgroundColor } from "./server/parse-gif-background-color";
import { isGifLikeImageParam } from "./server/is-gif-like-image-param";
import { ensureGifPaletteAnchors } from "./server/ensure-gif-palette-anchors";
import { tintWavePixel } from "./server/tint-wave-pixel";
import { hasAnimationEffect } from "./server/has-animation-effect";
import { hasPaletteColor } from "./server/has-palette-color";
import { hasActiveOverlayFilters } from "./server/has-active-overlay-filters";
import { sleep } from "./server/sleep";
import { decimateFramesToMaxCount } from "./server/decimate-frames-to-max-count";
import { isGifSignature } from "./animation/is-gif-signature";
import { detectImageFormat } from "./animation/detect-image-format";
import { calculateSourceFps } from "./animation/calculate-source-fps";
import { unpackOverlayColor } from "./overlay/unpack-overlay-color";
import { packOverlayColor } from "./overlay/pack-overlay-color";
import type { AnimationEffectConfig } from "./server/animation-effect-config.types";
import type { OverlayFilterOptions } from "./server/overlay-filter-options.types";
import type { ServerAnimationFrame } from "./server/server-animation-frame.types";

describe("domain/render/server (extended)", () => {
  // ── rgbToGrayServer ────────────────────────────────────────────

  describe("rgbToGrayServer", () => {
    it("returns 0 for black", () => {
      expect(rgbToGrayServer(0, 0, 0)).toBe(0);
    });

    it("returns ~255 for white", () => {
      expect(rgbToGrayServer(255, 255, 255)).toBeCloseTo(255, 0);
    });

    it("uses BT.601 weights", () => {
      const red = rgbToGrayServer(255, 0, 0);
      const green = rgbToGrayServer(0, 255, 0);
      const blue = rgbToGrayServer(0, 0, 255);
      expect(green).toBeGreaterThan(red);
      expect(red).toBeGreaterThan(blue);
    });
  });

  // ── adjustPixelColor ───────────────────────────────────────────

  describe("adjustPixelColor", () => {
    it("passes through when all transforms are identity", () => {
      const [r, g, b] = adjustPixelColor(0.5, 0.3, 0.7, false, 0, 1, 1, 0, 0);
      expect(r).toBeCloseTo(0.5, 5);
      expect(g).toBeCloseTo(0.3, 5);
      expect(b).toBeCloseTo(0.7, 5);
    });

    it("inverts colors", () => {
      const [r, g, b] = adjustPixelColor(0.2, 0.8, 0.5, true, 0, 1, 1, 0, 0);
      expect(r).toBeCloseTo(0.8, 5);
      expect(g).toBeCloseTo(0.2, 5);
      expect(b).toBeCloseTo(0.5, 5);
    });

    it("applies brightness offset", () => {
      const [r] = adjustPixelColor(0.5, 0.5, 0.5, false, 0.1, 1, 1, 0, 0);
      expect(r).toBeCloseTo(0.6, 5);
    });

    it("applies contrast factor", () => {
      const [r] = adjustPixelColor(0.8, 0.5, 0.5, false, 0, 2, 1, 0, 0);
      expect(r).toBeCloseTo(1.1, 5);
    });

    it("applies gamma correction", () => {
      const [r] = adjustPixelColor(0.25, 0.5, 0.5, false, 0, 1, 4, 0, 0);
      expect(r).toBeCloseTo(Math.pow(0.25, 0.25), 3);
    });

    it("combines invert + brightness", () => {
      const [r] = adjustPixelColor(0.3, 0.5, 0.5, true, 0.1, 1, 1, 0, 0);
      expect(r).toBeCloseTo(0.8, 5);
    });
  });

  // ── parseGifDisposalCode ───────────────────────────────────────

  describe("parseGifDisposalCode", () => {
    it("returns 0 for 'none'", () => {
      expect(parseGifDisposalCode("none")).toBe(0);
    });

    it("returns 1 for 'keep'", () => {
      expect(parseGifDisposalCode("keep")).toBe(1);
    });

    it("returns 3 for 'restore_previous'", () => {
      expect(parseGifDisposalCode("restore_previous")).toBe(3);
    });

    it("returns 2 for any other value", () => {
      expect(parseGifDisposalCode("background")).toBe(2);
      expect(parseGifDisposalCode("anything")).toBe(2);
    });
  });

  // ── parseGifBackgroundColor ────────────────────────────────────

  describe("parseGifBackgroundColor", () => {
    it("parses 6-char hex", () => {
      expect(parseGifBackgroundColor("#ff8040")).toEqual([255, 128, 64]);
    });

    it("parses 3-char shorthand hex", () => {
      expect(parseGifBackgroundColor("#f00")).toEqual([255, 0, 0]);
    });

    it("parses without # prefix", () => {
      expect(parseGifBackgroundColor("00ff00")).toEqual([0, 255, 0]);
    });

    it("returns white for invalid input", () => {
      expect(parseGifBackgroundColor("invalid")).toEqual([255, 255, 255]);
    });

    it("defaults to white for empty string", () => {
      expect(parseGifBackgroundColor("")).toEqual([255, 255, 255]);
    });
  });

  // ── isGifLikeImageParam ────────────────────────────────────────

  describe("isGifLikeImageParam", () => {
    it("returns true for .gif URL", () => {
      expect(isGifLikeImageParam("https://example.com/image.gif")).toBe(true);
    });

    it("returns true for .gif URL with query params", () => {
      expect(isGifLikeImageParam("https://example.com/image.gif?v=2")).toBe(true);
    });

    it("returns false for .png URL", () => {
      expect(isGifLikeImageParam("https://example.com/image.png")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isGifLikeImageParam(null)).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isGifLikeImageParam("")).toBe(false);
    });

    it("handles relative .gif path", () => {
      expect(isGifLikeImageParam("/images/logo.gif")).toBe(true);
    });
  });

  // ── ensureGifPaletteAnchors ────────────────────────────────────

  describe("ensureGifPaletteAnchors", () => {
    it("adds black when missing", () => {
      const palette = [[128, 128, 128]];
      const result = ensureGifPaletteAnchors(palette, 256);
      expect(result.some(([r, g, b]) => r === 0 && g === 0 && b === 0)).toBe(true);
    });

    it("adds white when missing", () => {
      const palette = [[128, 128, 128]];
      const result = ensureGifPaletteAnchors(palette, 256);
      expect(result.some(([r, g, b]) => r === 255 && g === 255 && b === 255)).toBe(true);
    });

    it("does not add black when already present", () => {
      const palette = [[0, 0, 0], [128, 128, 128]];
      const result = ensureGifPaletteAnchors(palette, 256);
      const blackCount = result.filter(([r, g, b]) => r === 0 && g === 0 && b === 0).length;
      expect(blackCount).toBe(1);
    });

    it("trims palette to max size", () => {
      const palette = Array.from({ length: 10 }, (_, i) => [i * 25, i * 25, i * 25]);
      const result = ensureGifPaletteAnchors(palette, 8);
      expect(result.length).toBeLessThanOrEqual(8);
    });
  });

  // ── tintWavePixel ──────────────────────────────────────────────

  describe("tintWavePixel", () => {
    it("tints dark pixels with wave color", () => {
      const data = new Uint8ClampedArray([50, 50, 50, 255]);
      tintWavePixel(data, 0, [255, 0, 0], 1.0);
      expect(data[0]).toBeGreaterThan(50);
    });

    it("darkens bright pixels", () => {
      const data = new Uint8ClampedArray([200, 200, 200, 255]);
      tintWavePixel(data, 0, [255, 0, 0], 1.0);
      expect(data[0]).toBeLessThan(200);
    });

    it("has no effect with zero intensity", () => {
      const data = new Uint8ClampedArray([100, 100, 100, 255]);
      const original = new Uint8ClampedArray(data);
      tintWavePixel(data, 0, [255, 0, 0], 0);
      expect(data[0]).toBe(original[0]);
    });
  });

  // ── hasAnimationEffect ─────────────────────────────────────────

  describe("hasAnimationEffect", () => {
    it("returns false for none pattern without color cycle", () => {
      expect(hasAnimationEffect({ pattern: "none", colorCycle: false } as AnimationEffectConfig)).toBe(false);
    });

    it("returns true for non-none pattern", () => {
      expect(hasAnimationEffect({ pattern: "pulse", colorCycle: false } as AnimationEffectConfig)).toBe(true);
    });

    it("returns true when color cycle is enabled", () => {
      expect(hasAnimationEffect({ pattern: "none", colorCycle: true } as AnimationEffectConfig)).toBe(true);
    });
  });

  // ── hasPaletteColor ────────────────────────────────────────────

  describe("hasPaletteColor", () => {
    it("returns true when predicate matches", () => {
      const palette = [[255, 0, 0], [0, 255, 0]];
      expect(hasPaletteColor(palette, (r) => r === 255)).toBe(true);
    });

    it("returns false when no match", () => {
      const palette = [[128, 128, 128]];
      expect(hasPaletteColor(palette, (r, g, b) => r === 0 && g === 0 && b === 0)).toBe(false);
    });

    it("returns false for empty palette", () => {
      expect(hasPaletteColor([], () => true)).toBe(false);
    });
  });

  // ── hasActiveOverlayFilters ────────────────────────────────────

  describe("hasActiveOverlayFilters", () => {
    const defaultFilters: OverlayFilterOptions = {
      brightness: 0,
      contrast: 0,
      gamma: 1,
      saturation: 0,
      hue: 0,
      invert: false,
      blur: 0,
      sharpen: 0,
      posterize: 1,
      edge: "off",
    } as OverlayFilterOptions;

    it("returns false for default filter values", () => {
      expect(hasActiveOverlayFilters(defaultFilters)).toBe(false);
    });

    it("returns true when brightness is non-zero", () => {
      expect(hasActiveOverlayFilters({ ...defaultFilters, brightness: 0.5 })).toBe(true);
    });

    it("returns true when invert is enabled", () => {
      expect(hasActiveOverlayFilters({ ...defaultFilters, invert: true })).toBe(true);
    });

    it("returns true when edge is not off", () => {
      expect(hasActiveOverlayFilters({ ...defaultFilters, edge: "sobel" } as OverlayFilterOptions)).toBe(true);
    });
  });

  // ── sleep ──────────────────────────────────────────────────────

  describe("sleep", () => {
    it("returns a promise", () => {
      const result = sleep(0);
      expect(result).toBeInstanceOf(Promise);
    });

    it("resolves after specified delay", async () => {
      await expect(sleep(1)).resolves.toBeUndefined();
    });
  });

  // ── decimateFramesToMaxCount ────────────────────────────────────

  describe("decimateFramesToMaxCount", () => {
    const makeFrame = (delay: number): ServerAnimationFrame =>
      ({ delay } as ServerAnimationFrame);

    it("returns original when count is within limit", () => {
      const frames = [makeFrame(100), makeFrame(100)];
      expect(decimateFramesToMaxCount(frames, 5)).toBe(frames);
    });

    it("returns original for single frame", () => {
      const frames = [makeFrame(100)];
      expect(decimateFramesToMaxCount(frames, 1)).toBe(frames);
    });

    it("reduces to target count", () => {
      const frames = Array.from({ length: 10 }, () => makeFrame(100));
      const result = decimateFramesToMaxCount(frames, 5);
      expect(result.length).toBe(5);
    });

    it("preserves total duration", () => {
      const frames = Array.from({ length: 10 }, () => makeFrame(100));
      const result = decimateFramesToMaxCount(frames, 3);
      const totalDelay = result.reduce((sum, f) => sum + f.delay, 0);
      expect(totalDelay).toBe(1000);
    });

    it("reduces to single frame when maxFrames is 1", () => {
      const frames = [makeFrame(100), makeFrame(200), makeFrame(300)];
      const result = decimateFramesToMaxCount(frames, 1);
      expect(result.length).toBe(1);
      expect(result[0].delay).toBe(600);
    });
  });

  // ── isGifSignature ─────────────────────────────────────────────

  describe("isGifSignature", () => {
    it("returns true for valid GIF89a signature", () => {
      const buf = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]).buffer;
      expect(isGifSignature(buf)).toBe(true);
    });

    it("returns true for valid GIF87a signature", () => {
      const buf = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]).buffer;
      expect(isGifSignature(buf)).toBe(true);
    });

    it("returns false for PNG signature", () => {
      const buf = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).buffer;
      expect(isGifSignature(buf)).toBe(false);
    });

    it("returns false for too-short buffer", () => {
      const buf = new Uint8Array([0x47, 0x49]).buffer;
      expect(isGifSignature(buf)).toBe(false);
    });
  });

  // ── detectImageFormat ──────────────────────────────────────────

  describe("detectImageFormat", () => {
    it("detects GIF format", () => {
      const buf = new Uint8Array(12);
      buf[0] = 0x47; buf[1] = 0x49; buf[2] = 0x46;
      expect(detectImageFormat(buf.buffer)).toBe("gif");
    });

    it("detects WebP format", () => {
      const buf = new Uint8Array(12);
      const riff = new TextEncoder().encode("RIFF");
      const webp = new TextEncoder().encode("WEBP");
      buf.set(riff, 0);
      buf.set(webp, 8);
      expect(detectImageFormat(buf.buffer)).toBe("webp");
    });

    it("returns unknown for unrecognized format", () => {
      const buf = new Uint8Array(12);
      expect(detectImageFormat(buf.buffer)).toBe("unknown");
    });

    it("returns unknown for small buffer", () => {
      const buf = new Uint8Array(4).buffer;
      expect(detectImageFormat(buf)).toBe("unknown");
    });
  });

  // ── calculateSourceFps ─────────────────────────────────────────

  describe("calculateSourceFps", () => {
    it("returns 10 for empty frames", () => {
      expect(calculateSourceFps([])).toBe(10);
    });

    it("calculates FPS from uniform delays", () => {
      const frames = [{ delay: 100 }, { delay: 100 }, { delay: 100 }];
      expect(calculateSourceFps(frames)).toBeCloseTo(10, 1);
    });

    it("calculates FPS from mixed delays", () => {
      const frames = [{ delay: 50 }, { delay: 50 }];
      expect(calculateSourceFps(frames)).toBeCloseTo(20, 1);
    });

    it("defaults missing delay to 100", () => {
      const frames = [{ delay: 0 }, { delay: 0 }];
      expect(calculateSourceFps(frames)).toBeCloseTo(10, 1);
    });
  });

  // ── unpackOverlayColor ─────────────────────────────────────────

  describe("unpackOverlayColor", () => {
    it("round-trips with packOverlayColor", () => {
      const packed = packOverlayColor(100, 200, 50);
      const result = unpackOverlayColor(packed);
      expect(result).toEqual({ r: 100, g: 200, b: 50 });
    });

    it("returns null when color flag is not set", () => {
      expect(unpackOverlayColor(0)).toBeNull();
    });

    it("unpacks boundary values", () => {
      const packed = packOverlayColor(0, 0, 0);
      const result = unpackOverlayColor(packed);
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("unpacks max values", () => {
      const packed = packOverlayColor(255, 255, 255);
      const result = unpackOverlayColor(packed);
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });
  });
});
