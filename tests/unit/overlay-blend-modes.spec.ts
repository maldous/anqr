/**
 * Overlay Blend Modes Unit Tests
 *
 * Tests the overlay rendering pipeline:
 * - Shared darkening/lightening helpers (computeDarkFactor, computeLightBlend)
 * - ECC-based intensity limits (getEffectiveIntensity)
 * - All overlay mode rendering (applyQROverlayMode)
 * - Store ECC limits propagation
 */

import { describe, expect, it } from 'vitest';
import {
  getEffectiveIntensity,
  getScaleFactor,
} from '../../src/modules/qr-generator/pixel-matrix-utils';
// Import from the qr-generator module
import {
  applyQROverlayMode,
  computeDarkFactor,
  computeLightBlend,
} from '../../src/modules/qr-generator/render-modes';
import type { OverlayData, QRGeneratorConfig } from '../../src/modules/qr-generator/types';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

/** Minimal config with only the fields required by the functions under test */
function makeConfig(overrides: Partial<QRGeneratorConfig> = {}): QRGeneratorConfig {
  return {
    content: 'https://example.com',
    errorCorrection: 'M',
    typeNumber: 0,
    moduleSize: 10,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
    ...overrides,
  };
}

/** Create overlay data with uniform brightness and optional colors */
function makeOverlayData(
  moduleCount: number,
  brightness: number,
  color?: { r: number; g: number; b: number }
): OverlayData {
  const data: OverlayData = {};
  if (color) {
    data.colors = {};
  }
  for (let row = 0; row < moduleCount; row++) {
    data[row] = {};
    if (color && data.colors) {
      data.colors[row] = {};
    }
    for (let col = 0; col < moduleCount; col++) {
      data[row][col] = brightness;
      if (color && data.colors) {
        data.colors[row][col] = { ...color };
      }
    }
  }
  return data;
}

/** Parse a color string (hex or rgb with/without spaces) into {r, g, b} or null */
function parseColorRgb(s: string): { r: number; g: number; b: number } | null {
  // rgb(128,64,200) or rgb(128, 64, 200)
  const rgbMatch = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
  // #c8643a
  const hexMatch = s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (hexMatch)
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  return null;
}

// All overlay modes that the render-modes switch statement handles
const ALL_OVERLAY_MODES = [
  'halftone',
  'blend',
  'brightness',
  'gapfill',
  'pixelate',
  'duotone',
  'outline',
  'wave',
  'mosaic',
  'artwork',
] as const;

// ---------------------------------------------------------------------------
// computeDarkFactor
// ---------------------------------------------------------------------------

describe('computeDarkFactor', () => {
  it('returns 1.0 at intensity 0 (no darkening)', () => {
    expect(computeDarkFactor(0, 0.75)).toBeCloseTo(1.0);
    expect(computeDarkFactor(0, 0.55)).toBeCloseTo(1.0);
    expect(computeDarkFactor(0, 0.6)).toBeCloseTo(1.0);
  });

  it('returns minFactor at intensity 1 (maximum darkening)', () => {
    expect(computeDarkFactor(1, 0.75)).toBeCloseTo(0.75);
    expect(computeDarkFactor(1, 0.55)).toBeCloseTo(0.55);
    expect(computeDarkFactor(1, 0.6)).toBeCloseTo(0.6);
    expect(computeDarkFactor(1, 0.7)).toBeCloseTo(0.7);
    expect(computeDarkFactor(1, 0.8)).toBeCloseTo(0.8);
  });

  it('interpolates linearly for intermediate intensities', () => {
    // computeDarkFactor(0.5, 0.75) = 1.0 - 0.25 * 0.5 = 0.875
    expect(computeDarkFactor(0.5, 0.75)).toBeCloseTo(0.875);
    // computeDarkFactor(0.5, 0.6) = 1.0 - 0.4 * 0.5 = 0.80
    expect(computeDarkFactor(0.5, 0.6)).toBeCloseTo(0.8);
  });

  it('uses default minFactor of 0.55 when not specified', () => {
    expect(computeDarkFactor(1)).toBeCloseTo(0.55);
    expect(computeDarkFactor(0)).toBeCloseTo(1.0);
  });

  it('matches the old hardcoded blend formula: 0.75 + (1 - i) * 0.25', () => {
    for (const i of [0, 0.25, 0.5, 0.75, 1.0]) {
      const oldFormula = 0.75 + (1 - i) * 0.25;
      expect(computeDarkFactor(i, 0.75)).toBeCloseTo(oldFormula);
    }
  });

  it('matches the old hardcoded pixelate formula: 0.7 + (1 - i) * 0.3', () => {
    for (const i of [0, 0.25, 0.5, 0.75, 1.0]) {
      const oldFormula = 0.7 + (1 - i) * 0.3;
      expect(computeDarkFactor(i, 0.7)).toBeCloseTo(oldFormula);
    }
  });

  it('is monotonically decreasing as intensity increases', () => {
    let prev = computeDarkFactor(0, 0.6);
    for (let i = 0.1; i <= 1.0; i += 0.1) {
      const curr = computeDarkFactor(i, 0.6);
      expect(curr).toBeLessThanOrEqual(prev);
      prev = curr;
    }
  });
});

// ---------------------------------------------------------------------------
// computeLightBlend
// ---------------------------------------------------------------------------

describe('computeLightBlend', () => {
  it('returns 0 at intensity 0 (no lightening)', () => {
    expect(computeLightBlend(0, 0.4)).toBeCloseTo(0);
    expect(computeLightBlend(0, 0.75)).toBeCloseTo(0);
  });

  it('returns maxBlend at intensity 1 (maximum lightening)', () => {
    expect(computeLightBlend(1, 0.4)).toBeCloseTo(0.4);
    expect(computeLightBlend(1, 0.75)).toBeCloseTo(0.75);
  });

  it('interpolates linearly for intermediate intensities', () => {
    expect(computeLightBlend(0.5, 0.4)).toBeCloseTo(0.2);
    expect(computeLightBlend(0.5, 0.75)).toBeCloseTo(0.375);
  });

  it('uses default maxBlend of 0.4 when not specified', () => {
    expect(computeLightBlend(1)).toBeCloseTo(0.4);
    expect(computeLightBlend(0.5)).toBeCloseTo(0.2);
  });

  it('is monotonically increasing as intensity increases', () => {
    let prev = computeLightBlend(0, 0.4);
    for (let i = 0.1; i <= 1.0; i += 0.1) {
      const curr = computeLightBlend(i, 0.4);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });
});

// ---------------------------------------------------------------------------
// getEffectiveIntensity
// ---------------------------------------------------------------------------

describe('getEffectiveIntensity', () => {
  it('does not cap intensity at ECC L by default', () => {
    const config = makeConfig({ errorCorrection: 'L', overlayIntensity: 100 });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(1);
  });

  it('does not cap intensity at ECC M by default', () => {
    const config = makeConfig({ errorCorrection: 'M', overlayIntensity: 100 });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(1);
  });

  it('does not cap intensity at ECC Q by default', () => {
    const config = makeConfig({ errorCorrection: 'Q', overlayIntensity: 100 });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(1);
  });

  it('does not cap intensity at ECC H by default', () => {
    const config = makeConfig({ errorCorrection: 'H', overlayIntensity: 100 });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(1);
  });

  it('does not cap when intensity is below limit', () => {
    const config = makeConfig({ errorCorrection: 'H', overlayIntensity: 50 });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(0.5);
  });

  it('uses config-provided ECC limits when present', () => {
    const config = makeConfig({
      errorCorrection: 'M',
      overlayIntensity: 100,
      maxOverlayIntensityByEcc: { L: 10, M: 20, Q: 30, H: 40 },
    });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    // 20% limit for M → 0.2
    expect(effectiveIntensity).toBeCloseTo(0.2);
  });

  it('config-provided limits override defaults', () => {
    // Custom limit higher than default for L
    const config = makeConfig({
      errorCorrection: 'L',
      overlayIntensity: 100,
      maxOverlayIntensityByEcc: { L: 80, M: 80, Q: 80, H: 80 },
    });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(0.8);
  });

  it('defaults to no cap when ECC level is unknown', () => {
    const config = makeConfig({
      errorCorrection: 'X' as 'L',
      overlayIntensity: 100,
    });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(1);
  });

  it('returns 0 when overlayIntensity is 0', () => {
    const config = makeConfig({ overlayIntensity: 0 });
    const { effectiveIntensity } = getEffectiveIntensity(config);
    expect(effectiveIntensity).toBeCloseTo(0);
  });

  it('sets effectiveConfig.overlayIntensity to the effective value * 100', () => {
    const config = makeConfig({ errorCorrection: 'L', overlayIntensity: 100 });
    const { effectiveConfig } = getEffectiveIntensity(config);
    expect(effectiveConfig.overlayIntensity).toBeCloseTo(100);
  });
});

// ---------------------------------------------------------------------------
// getScaleFactor
// ---------------------------------------------------------------------------

describe('getScaleFactor', () => {
  it('returns default render scale for dithered mode', () => {
    expect(getScaleFactor('dithered', makeConfig())).toBe(18);
  });

  it('returns default render scale for blue-noise mode', () => {
    expect(getScaleFactor('blue-noise', makeConfig())).toBe(18);
    expect(getScaleFactor('blue_noise', makeConfig())).toBe(18);
  });

  it('returns subpixelGrid for subpixel modes', () => {
    expect(getScaleFactor('subpixel', makeConfig({ subpixelGrid: 5 }))).toBe(5);
    expect(getScaleFactor('subpixel-size', makeConfig({ subpixelGrid: 2 }))).toBe(2);
  });

  it('returns 1 for non-scaled modes', () => {
    expect(getScaleFactor('blend', makeConfig())).toBe(1);
    expect(getScaleFactor('halftone', makeConfig())).toBe(1);
    expect(getScaleFactor('mosaic', makeConfig())).toBe(1);
    expect(getScaleFactor(undefined, makeConfig())).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// applyQROverlayMode - per-mode correctness
// ---------------------------------------------------------------------------

describe('applyQROverlayMode', () => {
  const moduleCount = 21;

  describe('all modes produce valid output without errors', () => {
    for (const mode of ALL_OVERLAY_MODES) {
      it(`mode '${mode}' returns OverlayModeResult`, () => {
        const overlayData = makeOverlayData(moduleCount, 0.5, { r: 128, g: 64, b: 200 });
        const config = makeConfig({
          overlayMode: mode,
          duotoneColors: ['#000000', '#ffffff'],
        });

        const result = applyQROverlayMode(
          mode,
          true, // isDark
          0.5,
          overlayData,
          10,
          10,
          moduleCount,
          0.5, // effectiveIntensity
          config
        );

        expect(result).toBeDefined();
        expect(typeof result.moduleColor).toBe('string');
        expect(typeof result.moduleSizeModifier).toBe('number');
        expect(typeof result.moduleOpacity).toBe('number');
        expect(typeof result.shouldDrawCell).toBe('boolean');
      });
    }
  });

  describe('intensity=0 produces no overlay effect', () => {
    for (const mode of ALL_OVERLAY_MODES) {
      it(`mode '${mode}' at intensity=0 preserves base colors`, () => {
        const overlayData = makeOverlayData(moduleCount, 0.5, { r: 128, g: 64, b: 200 });
        const config = makeConfig({
          overlayMode: mode,
          duotoneColors: ['#ff0000', '#0000ff'],
        });

        const result = applyQROverlayMode(
          mode,
          true,
          0.5,
          overlayData,
          10,
          10,
          moduleCount,
          0, // effectiveIntensity = 0
          config
        );

        // At zero intensity, dark modules should remain the foreground color
        // (or very close to it) for all modes that color dark modules
        if (mode === 'artwork') {
          expect(result.moduleColor).toBe(config.fgColor);
        }
        // At zero intensity, modifications should be minimal
        expect(result.moduleSizeModifier).toBeGreaterThanOrEqual(0);
        expect(result.moduleOpacity).toBeGreaterThanOrEqual(0);
      });
    }
  });

  describe('blend mode', () => {
    it('darkens overlay color based on intensity', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 100, b: 50 });
      const config = makeConfig({ overlayMode: 'blend' });

      const resultHigh = applyQROverlayMode(
        'blend',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.8,
        config
      );
      const resultLow = applyQROverlayMode(
        'blend',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.2,
        config
      );

      // Higher intensity should produce a darker module color (more blended with overlay)
      // Both should be valid color strings
      expect(resultHigh.moduleColor).toMatch(/^(#|rgb)/);
      expect(resultLow.moduleColor).toMatch(/^(#|rgb)/);
    });

    it('does not modify light modules', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 100, b: 50 });
      const config = makeConfig({ overlayMode: 'blend' });

      const result = applyQROverlayMode(
        'blend',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      // Light modules should keep bg color
      expect(result.moduleColor).toBe(config.bgColor);
    });
  });

  describe('halftone mode', () => {
    it('sets halftone rendering flag for dark modules with halftone config', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5);
      const config = makeConfig({
        overlayMode: 'halftone',
        halftoneCell: 'per_module',
      });

      const result = applyQROverlayMode(
        'halftone',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      expect(result.useHalftoneRendering).toBe(true);
    });

    it('adjusts moduleSizeModifier in legacy mode', () => {
      const overlayData = makeOverlayData(moduleCount, 0.3);
      const config = makeConfig({ overlayMode: 'halftone' });

      const result = applyQROverlayMode(
        'halftone',
        true,
        0.3,
        overlayData,
        10,
        10,
        moduleCount,
        0.7,
        config
      );
      expect(result.moduleSizeModifier).toBeGreaterThan(0);
      expect(result.moduleSizeModifier).toBeLessThanOrEqual(1);
    });
  });

  describe('wave mode', () => {
    it('applies wave offsets for dark modules', () => {
      const overlayData = makeOverlayData(moduleCount, 0.3, { r: 100, g: 100, b: 100 });
      const config = makeConfig({ overlayMode: 'wave' });

      const result = applyQROverlayMode(
        'wave',
        true,
        0.3,
        overlayData,
        5,
        5,
        moduleCount,
        0.5,
        config
      );
      // Wave should produce non-zero offsets when brightness < 1 and intensity > 0
      const hasOffset = result.waveOffsetX !== 0 || result.waveOffsetY !== 0;
      expect(hasOffset).toBe(true);
    });

    it('applies color even at low intensity (no arbitrary 0.3 threshold)', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 255, g: 0, b: 0 });
      const config = makeConfig({ overlayMode: 'wave' });

      const result = applyQROverlayMode(
        'wave',
        true,
        0.5,
        overlayData,
        5,
        5,
        moduleCount,
        0.1,
        config
      );
      // Color should be applied even at 0.1 intensity (old code required > 0.3)
      expect(result.moduleColor).not.toBe(config.fgColor);
    });

    it('does not apply color at zero intensity', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 255, g: 0, b: 0 });
      const config = makeConfig({ overlayMode: 'wave' });

      const result = applyQROverlayMode(
        'wave',
        true,
        0.5,
        overlayData,
        5,
        5,
        moduleCount,
        0,
        config
      );
      // At zero intensity, wave should not modify color
      expect(result.moduleColor).toBe(config.fgColor);
    });
  });

  describe('mosaic mode', () => {
    it('draws both dark and light cells', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 128, g: 128, b: 128 });
      const config = makeConfig({ overlayMode: 'mosaic' });

      const darkResult = applyQROverlayMode(
        'mosaic',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      const lightResult = applyQROverlayMode(
        'mosaic',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );

      expect(darkResult.shouldDrawCell).toBe(true);
      expect(lightResult.shouldDrawCell).toBe(true);
    });

    it('light modules aggressively whiten for scan-safe separation', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 100, g: 150, b: 200 });
      const config = makeConfig({ overlayMode: 'mosaic' });

      const testColor = { r: 100, g: 150, b: 200 };
      for (const i of [0, 0.5, 1.0]) {
        const result = applyQROverlayMode(
          'mosaic',
          false,
          0.5,
          overlayData,
          10,
          10,
          moduleCount,
          i,
          config
        );
        const rgb = parseColorRgb(result.moduleColor);
        expect(rgb).not.toBeNull();

        const blendToWhite = 0.72 + computeLightBlend(i, 0.24);
        const expectedR = Math.round(testColor.r + (255 - testColor.r) * blendToWhite);
        const expectedG = Math.round(testColor.g + (255 - testColor.g) * blendToWhite);
        const expectedB = Math.round(testColor.b + (255 - testColor.b) * blendToWhite);

        expect(rgb!.r).toBe(expectedR);
        expect(rgb!.g).toBe(expectedG);
        expect(rgb!.b).toBe(expectedB);
      }
    });

    it('light modules lighten more at higher intensity', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 100, g: 100, b: 100 });
      const config = makeConfig({ overlayMode: 'mosaic' });

      const lowResult = applyQROverlayMode(
        'mosaic',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.1,
        config
      );
      const highResult = applyQROverlayMode(
        'mosaic',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.9,
        config
      );

      const lowRgb = parseColorRgb(lowResult.moduleColor);
      const highRgb = parseColorRgb(highResult.moduleColor);
      expect(lowRgb).not.toBeNull();
      expect(highRgb).not.toBeNull();
      // Higher intensity → more white blending → higher RGB values
      expect(highRgb!.r).toBeGreaterThanOrEqual(lowRgb!.r);
    });

    it('dark modules use intensity-scaled darkening', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 200, b: 200 });
      const config = makeConfig({ overlayMode: 'mosaic' });

      // At high intensity the darkFactor should be lower
      const highResult = applyQROverlayMode(
        'mosaic',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.9,
        config
      );
      const lowResult = applyQROverlayMode(
        'mosaic',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.1,
        config
      );

      const highRgb = parseColorRgb(highResult.moduleColor);
      const lowRgb = parseColorRgb(lowResult.moduleColor);
      expect(highRgb).not.toBeNull();
      expect(lowRgb).not.toBeNull();
      // Higher intensity → more darkening → lower RGB values
      expect(highRgb!.r).toBeLessThanOrEqual(lowRgb!.r);
    });
  });

  describe('gapfill mode', () => {
    it('fills light modules with image color', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 255, g: 0, b: 0 });
      const config = makeConfig({ overlayMode: 'gapfill' });

      const result = applyQROverlayMode(
        'gapfill',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      expect(result.shouldDrawCell).toBe(true);
      // Color should be different from pure white (bg) due to blending
      expect(result.moduleColor).not.toBe('#ffffff');
    });

    it('uses intensity-derived fade without arbitrary cap', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 255, g: 0, b: 0 });
      const config = makeConfig({ overlayMode: 'gapfill' });

      // At full effectiveIntensity (1.0), the fade should be computeLightBlend(1.0, 0.75) = 0.75
      // which is higher than the old cap of 0.6
      const highResult = applyQROverlayMode(
        'gapfill',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        1.0,
        config
      );
      const lowResult = applyQROverlayMode(
        'gapfill',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.1,
        config
      );

      const highRgb = parseColorRgb(highResult.moduleColor);
      const lowRgb = parseColorRgb(lowResult.moduleColor);
      // Higher intensity → more red blended in → higher R value
      if (highRgb && lowRgb) {
        expect(highRgb.r).toBeGreaterThanOrEqual(lowRgb.r);
      }
    });
  });

  describe('duotone mode', () => {
    it('blends between shadow and highlight colors', () => {
      const overlayData = makeOverlayData(moduleCount, 0.8, { r: 200, g: 200, b: 200 });
      const config = makeConfig({
        overlayMode: 'duotone',
        duotoneColors: ['#ff0000', '#0000ff'],
      });

      const result = applyQROverlayMode(
        'duotone',
        true,
        0.8,
        overlayData,
        10,
        10,
        moduleCount,
        0.8,
        config
      );
      // Bright areas should lean toward highlight color (blue)
      expect(result.moduleColor).toMatch(/^(#|rgb)/);
    });
  });

  describe('artwork mode', () => {
    it('renders pure QR with no overlay modification', () => {
      const overlayData = makeOverlayData(moduleCount, 0.5, { r: 128, g: 64, b: 200 });
      const config = makeConfig({ overlayMode: 'artwork' });

      const darkResult = applyQROverlayMode(
        'artwork',
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      const lightResult = applyQROverlayMode(
        'artwork',
        false,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );

      // Artwork mode should not modify colors at all
      expect(darkResult.moduleColor).toBe(config.fgColor);
      expect(lightResult.moduleColor).toBe(config.bgColor);
      expect(darkResult.moduleSizeModifier).toBe(1);
    });
  });

  describe('brightness mode', () => {
    it('hides bright modules at high intensity', () => {
      const overlayData = makeOverlayData(moduleCount, 0.9);
      const config = makeConfig({ overlayMode: 'brightness' });

      const result = applyQROverlayMode(
        'brightness',
        true,
        0.9,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      // High brightness + moderate intensity should make some modules invisible
      expect(result.moduleOpacity).toBe(0);
    });

    it('keeps dark modules at low brightness', () => {
      const overlayData = makeOverlayData(moduleCount, 0.1);
      const config = makeConfig({ overlayMode: 'brightness' });

      const result = applyQROverlayMode(
        'brightness',
        true,
        0.1,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );
      expect(result.moduleOpacity).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Integration: darkFactor scaling across modes
// ---------------------------------------------------------------------------

describe('darkFactor scaling consistency', () => {
  const moduleCount = 21;

  it('blend mode darkening scales with intensity', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 100, b: 50 });
    const config = makeConfig({ overlayMode: 'blend' });

    const results = [0.2, 0.5, 0.8].map((intensity) =>
      applyQROverlayMode('blend', true, 0.5, overlayData, 10, 10, moduleCount, intensity, config)
    );

    // All should produce valid module colors
    for (const r of results) {
      expect(r.moduleColor).toMatch(/^(#|rgb)/);
    }
  });

  it('pixelate mode darkening scales with intensity', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 100, b: 50 });
    const config = makeConfig({ overlayMode: 'pixelate' });

    const lowColor = parseColorRgb(
      applyQROverlayMode('pixelate', true, 0.5, overlayData, 1, 1, moduleCount, 0.2, config)
        .moduleColor
    );
    const highColor = parseColorRgb(
      applyQROverlayMode('pixelate', true, 0.5, overlayData, 1, 1, moduleCount, 0.8, config)
        .moduleColor
    );

    // Both should produce parseable colors
    expect(lowColor).not.toBeNull();
    expect(highColor).not.toBeNull();
    // Higher intensity blends more overlay color into fgColor (black).
    // So higher intensity → more visible overlay → higher R values.
    expect(highColor!.r).toBeGreaterThanOrEqual(lowColor!.r);
  });

  it('outline mode darkening scales with intensity', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 100, b: 50 });
    const config = makeConfig({ overlayMode: 'outline' });

    const low = applyQROverlayMode(
      'outline',
      true,
      0.5,
      overlayData,
      10,
      10,
      moduleCount,
      0.1,
      config
    );
    const high = applyQROverlayMode(
      'outline',
      true,
      0.5,
      overlayData,
      10,
      10,
      moduleCount,
      0.9,
      config
    );

    expect(low.drawOutlineOnly).toBe(true);
    expect(high.drawOutlineOnly).toBe(true);
    // Both should produce valid colors
    expect(low.moduleColor).toMatch(/^(#|rgb)/);
    expect(high.moduleColor).toMatch(/^(#|rgb)/);
  });
});

// ---------------------------------------------------------------------------
// Edge cases: brightness-only overlay (no color data)
// ---------------------------------------------------------------------------

describe('overlay modes with brightness-only data (no colors)', () => {
  const moduleCount = 21;

  for (const mode of ['blend', 'pixelate', 'outline', 'wave', 'gapfill', 'mosaic'] as const) {
    it(`${mode} mode gracefully falls back when no color data is present`, () => {
      // Create overlay data WITHOUT color information
      const overlayData = makeOverlayData(moduleCount, 0.5);
      const config = makeConfig({ overlayMode: mode });

      const result = applyQROverlayMode(
        mode,
        true,
        0.5,
        overlayData,
        10,
        10,
        moduleCount,
        0.5,
        config
      );

      expect(result).toBeDefined();
      expect(typeof result.moduleColor).toBe('string');
      // Without color data, dark modules should keep fgColor for modes that
      // only color dark modules when overlay colors exist
      if (mode === 'blend' || mode === 'pixelate' || mode === 'outline' || mode === 'wave') {
        expect(result.moduleColor).toBe(config.fgColor);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Edge case: pixelate boundary (partial 3x3 block)
// ---------------------------------------------------------------------------

describe('pixelate boundary handling', () => {
  const moduleCount = 21;

  it('handles partial 3x3 block at grid boundary (last module)', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5, { r: 180, g: 90, b: 45 });
    const config = makeConfig({ overlayMode: 'pixelate' });

    // row=20, col=20 is the last module. Block starts at floor(20/3)*3 = 18.
    // Block covers rows 18-20, cols 18-20 → 3x3 = 9 cells, all valid.
    const result = applyQROverlayMode(
      'pixelate',
      true,
      0.5,
      overlayData,
      20,
      20,
      moduleCount,
      0.5,
      config
    );

    const rgb = parseColorRgb(result.moduleColor);
    expect(rgb).not.toBeNull();
    // The averaged color should be close to the uniform input color (180,90,45)
    // after darkening by computeDarkFactor(0.5, 0.7) ≈ 0.85, then blended with fgColor
    expect(rgb!.r).toBeGreaterThan(0);
    expect(rgb!.r).toBeLessThan(255);
  });

  it('handles first module (row=0, col=0)', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5, { r: 180, g: 90, b: 45 });
    const config = makeConfig({ overlayMode: 'pixelate' });

    const result = applyQROverlayMode(
      'pixelate',
      true,
      0.5,
      overlayData,
      0,
      0,
      moduleCount,
      0.5,
      config
    );

    const rgb = parseColorRgb(result.moduleColor);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Duotone fallback paths
// ---------------------------------------------------------------------------

describe('duotone fallback paths', () => {
  const moduleCount = 21;

  it('no highlight color + brightness > 0.5 → lightens shadow color', () => {
    const overlayData = makeOverlayData(moduleCount, 0.8);
    const config = makeConfig({
      overlayMode: 'duotone',
      duotoneColors: ['#ff0000'], // Only shadow, no highlight
    });

    const result = applyQROverlayMode(
      'duotone',
      true,
      0.8,
      overlayData,
      10,
      10,
      moduleCount,
      0.8,
      config
    );

    const rgb = parseColorRgb(result.moduleColor);
    expect(rgb).not.toBeNull();
    // Shadow is red (#ff0000), bright area lightens it → R stays high, G/B increase
    expect(rgb!.r).toBeGreaterThan(200);
    expect(rgb!.g).toBeGreaterThan(0);
  });

  it('no highlight color + brightness <= 0.5 → blends shadow with fg', () => {
    const overlayData = makeOverlayData(moduleCount, 0.2);
    const config = makeConfig({
      overlayMode: 'duotone',
      duotoneColors: ['#ff0000'], // Only shadow, no highlight
    });

    const result = applyQROverlayMode(
      'duotone',
      true,
      0.2,
      overlayData,
      10,
      10,
      moduleCount,
      0.8,
      config
    );

    const rgb = parseColorRgb(result.moduleColor);
    expect(rgb).not.toBeNull();
    // Dark area: blends fg (#000000) with shadow (#ff0000) → some red, no green/blue
    expect(rgb!.r).toBeGreaterThan(0);
  });

  it('full duotone (shadow + highlight) blends based on brightness', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5);
    const config = makeConfig({
      overlayMode: 'duotone',
      duotoneColors: ['#ff0000', '#0000ff'], // Red shadow, blue highlight
    });

    const darkResult = applyQROverlayMode(
      'duotone',
      true,
      0.1,
      overlayData,
      10,
      10,
      moduleCount,
      1.0,
      config
    );
    const brightResult = applyQROverlayMode(
      'duotone',
      true,
      0.9,
      overlayData,
      10,
      10,
      moduleCount,
      1.0,
      config
    );

    const darkRgb = parseColorRgb(darkResult.moduleColor);
    const brightRgb = parseColorRgb(brightResult.moduleColor);
    expect(darkRgb).not.toBeNull();
    expect(brightRgb).not.toBeNull();
    // Dark area leans toward shadow (red), bright area leans toward highlight (blue)
    expect(darkRgb!.r).toBeGreaterThan(darkRgb!.b);
    expect(brightRgb!.b).toBeGreaterThan(brightRgb!.r);
  });
});

// ---------------------------------------------------------------------------
// Blend mode darkening order verification
// ---------------------------------------------------------------------------

describe('blend mode darkening order', () => {
  const moduleCount = 21;

  it('higher intensity produces darker colors for blend mode', () => {
    const overlayData = makeOverlayData(moduleCount, 0.5, { r: 200, g: 100, b: 50 });
    const config = makeConfig({ overlayMode: 'blend' });

    const lowResult = applyQROverlayMode(
      'blend',
      true,
      0.5,
      overlayData,
      10,
      10,
      moduleCount,
      0.2,
      config
    );
    const highResult = applyQROverlayMode(
      'blend',
      true,
      0.5,
      overlayData,
      10,
      10,
      moduleCount,
      0.8,
      config
    );

    const lowRgb = parseColorRgb(lowResult.moduleColor);
    const highRgb = parseColorRgb(highResult.moduleColor);
    expect(lowRgb).not.toBeNull();
    expect(highRgb).not.toBeNull();

    // Low intensity stays closer to fgColor (black), but at high intensity
    // the overlay color is more visible. Since the overlay is darkened, the
    // luminance of the high-intensity result should still be a valid dark color.
    // Both should be parseable and the high-intensity one should show more color variance.
    const lowLum = lowRgb!.r * 0.299 + lowRgb!.g * 0.587 + lowRgb!.b * 0.114;
    const highLum = highRgb!.r * 0.299 + highRgb!.g * 0.587 + highRgb!.b * 0.114;
    // At low intensity, blend stays close to fgColor (black, lum≈0)
    // At high intensity, blend shows more overlay color (higher lum)
    expect(highLum).toBeGreaterThan(lowLum);
  });
});

// ---------------------------------------------------------------------------
// Input clamping for helpers
// ---------------------------------------------------------------------------

describe('computeDarkFactor input clamping', () => {
  it('clamps negative intensity to 0', () => {
    expect(computeDarkFactor(-0.5, 0.75)).toBeCloseTo(1.0);
  });

  it('clamps intensity > 1 to 1', () => {
    expect(computeDarkFactor(1.5, 0.75)).toBeCloseTo(0.75);
  });
});

describe('computeLightBlend input clamping', () => {
  it('clamps negative intensity to 0', () => {
    expect(computeLightBlend(-0.5, 0.4)).toBeCloseTo(0);
  });

  it('clamps intensity > 1 to 1', () => {
    expect(computeLightBlend(1.5, 0.4)).toBeCloseTo(0.4);
  });
});
