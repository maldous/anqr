import { describe, it, expect } from "vitest";
import { computeNormalizationStrength } from "./overlay/compute-normalization-strength";
import { shouldAutoNormalizeColor } from "./overlay/should-auto-normalize-color";
import type { QRGeneratorConfig } from "./qr-generator-shared";
import type { OverlayToneStats } from "./overlay/overlay-tone-stats";

function makeStats(overrides: Partial<OverlayToneStats> = {}): OverlayToneStats {
  return {
    lumaMean: 0.5,
    lumaStd: 0.1,
    saturationMean: 0.1,
    clippedDarkRatio: 0,
    clippedLightRatio: 0,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<QRGeneratorConfig> = {}): QRGeneratorConfig {
  return {
    colorMode: "color",
    overlayMode: "dithered",
    scanGateProfile: "full",
    ...overrides,
  } as QRGeneratorConfig;
}

describe("domain/render/filters (pure)", () => {
  // ── computeNormalizationStrength ────────────────────────────

  describe("computeNormalizationStrength", () => {
    it("returns 0 for low-risk stats and low intensity", () => {
      const result = computeNormalizationStrength(makeStats(), 0.1);
      expect(result).toBe(0);
    });

    it("increases with high lumaStd (contrast risk)", () => {
      const low = computeNormalizationStrength(makeStats({ lumaStd: 0.1 }), 0.5);
      const high = computeNormalizationStrength(makeStats({ lumaStd: 0.4 }), 0.5);
      expect(high).toBeGreaterThan(low);
    });

    it("increases with high saturationMean", () => {
      const low = computeNormalizationStrength(makeStats({ saturationMean: 0.1 }), 0.5);
      const high = computeNormalizationStrength(makeStats({ saturationMean: 0.6 }), 0.5);
      expect(high).toBeGreaterThan(low);
    });

    it("increases with high clipped ratios", () => {
      const low = computeNormalizationStrength(makeStats(), 0.5);
      const high = computeNormalizationStrength(
        makeStats({ clippedDarkRatio: 0.3, clippedLightRatio: 0.2 }),
        0.5,
      );
      expect(high).toBeGreaterThan(low);
    });

    it("increases with high overlay intensity", () => {
      const low = computeNormalizationStrength(makeStats({ lumaStd: 0.3 }), 0.2);
      const high = computeNormalizationStrength(makeStats({ lumaStd: 0.3 }), 0.9);
      expect(high).toBeGreaterThan(low);
    });

    it("clamps result to [0, 1]", () => {
      const result = computeNormalizationStrength(
        makeStats({
          lumaStd: 1.0,
          saturationMean: 1.0,
          clippedDarkRatio: 0.5,
          clippedLightRatio: 0.5,
        }),
        1.0,
      );
      expect(result).toBeLessThanOrEqual(1);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("returns 0 for all-zero stats and zero intensity", () => {
      const result = computeNormalizationStrength(
        makeStats({
          lumaStd: 0,
          saturationMean: 0,
          clippedDarkRatio: 0,
          clippedLightRatio: 0,
        }),
        0,
      );
      expect(result).toBe(0);
    });
  });

  // ── shouldAutoNormalizeColor ────────────────────────────────

  describe("shouldAutoNormalizeColor", () => {
    it("returns true for dithered overlay in color mode", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ overlayMode: "dithered" }))).toBe(true);
    });

    it("returns true for blue-noise overlay", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ overlayMode: "blue-noise" }))).toBe(true);
    });

    it("returns true for blue_noise overlay", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ overlayMode: "blue_noise" }))).toBe(true);
    });

    it("returns true for artwork overlay", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ overlayMode: "artwork" }))).toBe(true);
    });

    it("returns false when disableAutoSoften is true", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ disableAutoSoften: true }))).toBe(false);
    });

    it("returns false when qrFirstMode is true", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ qrFirstMode: true }))).toBe(false);
    });

    it("returns false when scanGateProfile is off", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ scanGateProfile: "off" }))).toBe(false);
    });

    it("returns false when colorMode is not color", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ colorMode: "grayscale" }))).toBe(false);
    });

    it("returns false for unsupported overlay mode", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ overlayMode: "standard" }))).toBe(false);
    });

    it("defaults scanGateProfile to full when undefined", () => {
      expect(shouldAutoNormalizeColor(makeConfig({ scanGateProfile: undefined }))).toBe(true);
    });
  });
});
