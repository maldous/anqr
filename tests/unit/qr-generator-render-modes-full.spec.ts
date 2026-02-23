import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ImageData polyfill for node
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height!;
    }
    this.colorSpace = 'srgb';
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

describe('qr-generator/render-modes.ts', () => {
  describe('computeDarkFactor', () => {
    it('intensity=0 → 1.0 (no darkening)', async () => {
      const { computeDarkFactor } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeDarkFactor(0)).toBeCloseTo(1.0);
    });

    it('intensity=1 → default minFactor 0.55', async () => {
      const { computeDarkFactor } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeDarkFactor(1)).toBeCloseTo(0.55);
    });

    it('intensity=0.5 → midpoint between 1.0 and 0.55', async () => {
      const { computeDarkFactor } = await import('../../src/modules/qr-generator/render-modes');
      // 1.0 - (1.0 - 0.55) * 0.5 = 1.0 - 0.225 = 0.775
      expect(computeDarkFactor(0.5)).toBeCloseTo(0.775);
    });

    it('custom minFactor', async () => {
      const { computeDarkFactor } = await import('../../src/modules/qr-generator/render-modes');
      // intensity=1, minFactor=0.3 → 0.3
      expect(computeDarkFactor(1, 0.3)).toBeCloseTo(0.3);
      // intensity=0, minFactor=0.3 → 1.0
      expect(computeDarkFactor(0, 0.3)).toBeCloseTo(1.0);
      // intensity=0.5, minFactor=0.3 → 1.0 - 0.7 * 0.5 = 0.65
      expect(computeDarkFactor(0.5, 0.3)).toBeCloseTo(0.65);
    });

    it('clamps intensity below 0', async () => {
      const { computeDarkFactor } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeDarkFactor(-1)).toBeCloseTo(1.0);
    });

    it('clamps intensity above 1', async () => {
      const { computeDarkFactor } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeDarkFactor(2)).toBeCloseTo(0.55);
    });
  });

  describe('computeLightBlend', () => {
    it('intensity=0 → 0 (no lightening)', async () => {
      const { computeLightBlend } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeLightBlend(0)).toBeCloseTo(0);
    });

    it('intensity=1 → default maxBlend 0.4', async () => {
      const { computeLightBlend } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeLightBlend(1)).toBeCloseTo(0.4);
    });

    it('intensity=0.5 → 0.2', async () => {
      const { computeLightBlend } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeLightBlend(0.5)).toBeCloseTo(0.2);
    });

    it('custom maxBlend', async () => {
      const { computeLightBlend } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeLightBlend(1, 0.8)).toBeCloseTo(0.8);
      expect(computeLightBlend(0.5, 0.8)).toBeCloseTo(0.4);
    });

    it('clamps intensity below 0', async () => {
      const { computeLightBlend } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeLightBlend(-1)).toBeCloseTo(0);
    });

    it('clamps intensity above 1', async () => {
      const { computeLightBlend } = await import('../../src/modules/qr-generator/render-modes');
      expect(computeLightBlend(2)).toBeCloseTo(0.4);
    });
  });

  describe('applyQROverlayMode', () => {
    // Helper to build minimal config
    function makeConfig(overrides: Record<string, unknown> = {}) {
      return {
        fgColor: '#000000',
        bgColor: '#ffffff',
        ...overrides,
      } as never;
    }

    // Helper to build overlay data with colors - must wrap in { colors: ... } to match OverlayData type
    function makeOverlayWithColors(row: number, col: number, r: number, g: number, b: number) {
      const colors: Record<number, Record<number, { r: number; g: number; b: number }>> = {};
      colors[row] = { [col]: { r, g, b } };
      return { colors } as never;
    }

    // Helper to build overlay data with a 3x3 block of colors for pixelate
    function makeBlockColors(startRow: number, startCol: number, r: number, g: number, b: number) {
      const colors: Record<number, Record<number, { r: number; g: number; b: number }>> = {};
      for (let dr = 0; dr < 3; dr++) {
        colors[startRow + dr] = {};
        for (let dc = 0; dc < 3; dc++) {
          colors[startRow + dr][startCol + dc] = { r, g, b };
        }
      }
      return { colors } as never;
    }

    it('undefined mode → default result (dark module uses fg)', async () => {
      const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
      const result = applyQROverlayMode(undefined, true, 0.5, {}, 5, 5, 21, 0.5, makeConfig());
      expect(result.moduleColor).toBe('#000000');
      expect(result.shouldDrawCell).toBe(true);
      expect(result.moduleSizeModifier).toBe(1);
      expect(result.moduleOpacity).toBe(1);
      expect(result.drawOutlineOnly).toBe(false);
      expect(result.useHalftoneRendering).toBe(false);
    });

    it('undefined mode → default result (light module uses bg)', async () => {
      const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
      const result = applyQROverlayMode(undefined, false, 0.5, {}, 5, 5, 21, 0.5, makeConfig());
      expect(result.moduleColor).toBe('#ffffff');
      expect(result.shouldDrawCell).toBe(false);
    });

    it('unknown mode → returns default', async () => {
      const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
      const result = applyQROverlayMode(
        'nonexistent_mode',
        true,
        0.5,
        {},
        5,
        5,
        21,
        0.5,
        makeConfig()
      );
      expect(result.moduleColor).toBe('#000000');
      expect(result.shouldDrawCell).toBe(true);
    });

    // --- halftone ---
    describe('halftone mode', () => {
      it('isDark=true without halftone config → legacy moduleSizeModifier', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('halftone', true, 0.8, {}, 5, 5, 21, 0.7, makeConfig());
        expect(result.useHalftoneRendering).toBe(false);
        expect(result.moduleSizeModifier).toBeGreaterThan(0);
        expect(result.moduleSizeModifier).toBeLessThanOrEqual(1);
      });

      it('isDark=true with halftoneCell config → useHalftoneRendering=true', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'halftone',
          true,
          0.5,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig({ halftoneCell: 8 })
        );
        expect(result.useHalftoneRendering).toBe(true);
        // halftoneBrightness = 0.5 + (brightness - 0.5) * intensity
        // = 0.5 + 0 * 0.8 = 0.5 (since brightness is exactly 0.5)
        expect(result.halftoneBrightness).toBeCloseTo(0.5);
      });

      it('isDark=true with s-curve brightness curve', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'halftone',
          true,
          0.8,
          {},
          5,
          5,
          21,
          1.0,
          makeConfig({ halftoneCell: 8, brightnessCurve: 's-curve' })
        );
        expect(result.useHalftoneRendering).toBe(true);
        // S-curve: 0.8 * 0.8 * (3 - 2 * 0.8) = 0.64 * 1.4 = 0.896
        // halftoneBrightness = 0.5 + (0.896 - 0.5) * 1.0 = 0.896
        expect(result.halftoneBrightness).toBeCloseTo(0.896, 2);
      });

      it('isDark=true with s_curve brightness curve (alternate name)', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'halftone',
          true,
          0.8,
          {},
          5,
          5,
          21,
          1.0,
          makeConfig({ halftoneDotShape: 'round', brightnessCurve: 's_curve' })
        );
        expect(result.useHalftoneRendering).toBe(true);
        expect(result.halftoneBrightness).toBeCloseTo(0.896, 2);
      });

      it('isDark=true with gamma brightness curve', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'halftone',
          true,
          0.5,
          {},
          5,
          5,
          21,
          1.0,
          makeConfig({ halftoneCell: 8, brightnessCurve: 'gamma' })
        );
        expect(result.useHalftoneRendering).toBe(true);
        // Gamma: 0.5^0.7 ≈ 0.6156
        // halftoneBrightness = 0.5 + (0.6156 - 0.5) * 1.0 = 0.6156
        expect(result.halftoneBrightness).toBeCloseTo(0.5 + (0.5 ** 0.7 - 0.5), 2);
      });

      it('isDark=false → no halftone effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('halftone', false, 0.5, {}, 5, 5, 21, 0.5, makeConfig());
        expect(result.useHalftoneRendering).toBe(false);
        expect(result.moduleSizeModifier).toBe(1);
      });

      it('legacy halftone: high brightness → smaller module', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const highBright = applyQROverlayMode(
          'halftone',
          true,
          0.9,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        const lowBright = applyQROverlayMode(
          'halftone',
          true,
          0.1,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        // Low brightness (dark overlay) → larger dots
        expect(lowBright.moduleSizeModifier).toBeGreaterThanOrEqual(highBright.moduleSizeModifier);
      });
    });

    // --- blend ---
    describe('blend mode', () => {
      it('isDark=true with colors → blended moduleColor', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 255, 0, 0);
        const result = applyQROverlayMode(
          'blend',
          true,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        // Should be blended between fg (#000000) and darkened red
        expect(result.moduleColor).not.toBe('#000000');
        expect(result.shouldDrawCell).toBe(true);
      });

      it('isDark=true without colors → keeps fg', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('blend', true, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.moduleColor).toBe('#000000');
      });

      it('isDark=false → no blend effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 255, 0, 0);
        const result = applyQROverlayMode(
          'blend',
          false,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        expect(result.moduleColor).toBe('#ffffff');
      });
    });

    // --- brightness ---
    describe('brightness mode', () => {
      it('isDark=true, brightness above threshold → opacity=0', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        // effectiveIntensity=0.5, threshold = 1 - 0.5 = 0.5
        // brightness=0.8 > 0.5 → opacity = 0
        const result = applyQROverlayMode('brightness', true, 0.8, {}, 5, 5, 21, 0.5, makeConfig());
        expect(result.moduleOpacity).toBe(0);
      });

      it('isDark=true, brightness below threshold → normal opacity', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        // effectiveIntensity=0.5, threshold = 0.5
        // brightness=0.3 < 0.5 → opacity stays 1
        const result = applyQROverlayMode('brightness', true, 0.3, {}, 5, 5, 21, 0.5, makeConfig());
        expect(result.moduleOpacity).toBe(1);
      });

      it('isDark=false → no brightness effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'brightness',
          false,
          0.8,
          {},
          5,
          5,
          21,
          0.5,
          makeConfig()
        );
        expect(result.moduleOpacity).toBe(1);
      });
    });

    // --- gapfill ---
    describe('gapfill mode', () => {
      it('isDark=false with colors → shouldDrawCell=true, blended color', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 0, 128, 255);
        const result = applyQROverlayMode(
          'gapfill',
          false,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        expect(result.shouldDrawCell).toBe(true);
        expect(result.moduleColor).not.toBe('#ffffff');
      });

      it('isDark=false without colors → no gap fill', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('gapfill', false, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        // shouldDrawCell stays false for light modules without colors
        expect(result.moduleColor).toBe('#ffffff');
      });

      it('isDark=true → uses fg color', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('gapfill', true, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.moduleColor).toBe('#000000');
      });
    });

    // --- pixelate ---
    describe('pixelate mode', () => {
      it('isDark=true with 3x3 block colors → averaged and darkened color', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        // Row 5, col 5 → blockRow=3 (floor(5/3)*3), blockCol=3
        const overlayData = makeBlockColors(3, 3, 200, 100, 50);
        const result = applyQROverlayMode(
          'pixelate',
          true,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        expect(result.moduleColor).not.toBe('#000000');
        expect(result.shouldDrawCell).toBe(true);
      });

      it('isDark=true without colors → keeps fg', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('pixelate', true, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.moduleColor).toBe('#000000');
      });

      it('isDark=false → no pixelate effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('pixelate', false, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.moduleColor).toBe('#ffffff');
      });
    });

    // --- duotone ---
    describe('duotone mode', () => {
      it('isDark=true with highlight color → blended duotone', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'duotone',
          true,
          0.5,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig({ duotoneColors: ['#ff0000', '#0000ff'] })
        );
        // Should blend between red shadow and blue highlight based on brightness
        expect(result.moduleColor).not.toBe('#000000');
        expect(result.shouldDrawCell).toBe(true);
      });

      it('isDark=true without highlight, brightness > 0.5 → lightened shadow', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'duotone',
          true,
          0.8,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig({ duotoneColors: ['#ff0000'] })
        );
        // Shadow red gets lightened for bright areas
        expect(result.moduleColor).toMatch(/^rgb\(/);
      });

      it('isDark=true without highlight, brightness <= 0.5 → shadow blended with fg', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'duotone',
          true,
          0.3,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig({ duotoneColors: ['#ff0000'] })
        );
        expect(result.moduleColor).not.toBe('#000000');
      });

      it('isDark=true with no duotoneColors → falls back to fg as shadow', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('duotone', true, 0.3, {}, 5, 5, 21, 0.5, makeConfig());
        expect(result.shouldDrawCell).toBe(true);
      });

      it('isDark=false → no duotone effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode(
          'duotone',
          false,
          0.5,
          {},
          5,
          5,
          21,
          0.8,
          makeConfig({ duotoneColors: ['#ff0000', '#0000ff'] })
        );
        expect(result.moduleColor).toBe('#ffffff');
      });
    });

    // --- outline ---
    describe('outline mode', () => {
      it('isDark=true → drawOutlineOnly=true', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('outline', true, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.drawOutlineOnly).toBe(true);
      });

      it('isDark=true with colors → blended outline color', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 0, 255, 0);
        const result = applyQROverlayMode(
          'outline',
          true,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        expect(result.drawOutlineOnly).toBe(true);
        expect(result.moduleColor).not.toBe('#000000');
      });

      it('isDark=false → no outline effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('outline', false, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.drawOutlineOnly).toBe(false);
      });
    });

    // --- wave ---
    describe('wave mode', () => {
      it('isDark=true → non-zero wave offsets', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('wave', true, 0.2, {}, 5, 5, 21, 0.8, makeConfig());
        // Low brightness + high intensity → visible wave strength
        const hasOffset = result.waveOffsetX !== 0 || result.waveOffsetY !== 0;
        expect(hasOffset).toBe(true);
      });

      it('isDark=true with colors → blended color and wave offsets', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 128, 64, 200);
        const result = applyQROverlayMode(
          'wave',
          true,
          0.3,
          overlayData,
          5,
          5,
          21,
          0.7,
          makeConfig()
        );
        expect(result.moduleColor).not.toBe('#000000');
      });

      it('isDark=false → no wave effect', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('wave', false, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.waveOffsetX).toBe(0);
        expect(result.waveOffsetY).toBe(0);
      });

      it('intensity=0 → zero wave strength', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('wave', true, 0.5, {}, 5, 5, 21, 0, makeConfig());
        expect(result.waveOffsetX).toBeCloseTo(0);
        expect(result.waveOffsetY).toBeCloseTo(0);
      });
    });

    // --- mosaic ---
    describe('mosaic mode', () => {
      it('shouldDrawCell=true for dark modules', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 200, 100, 50);
        const result = applyQROverlayMode(
          'mosaic',
          true,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        expect(result.shouldDrawCell).toBe(true);
        expect(result.moduleColor).toMatch(/^rgb\(/);
      });

      it('shouldDrawCell=true for light modules with colors', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const overlayData = makeOverlayWithColors(5, 5, 200, 100, 50);
        const result = applyQROverlayMode(
          'mosaic',
          false,
          0.5,
          overlayData,
          5,
          5,
          21,
          0.8,
          makeConfig()
        );
        expect(result.shouldDrawCell).toBe(true);
        // Light modules get lightened colors
        expect(result.moduleColor).toMatch(/^rgb\(/);
      });

      it('without colors → still shouldDrawCell=true', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('mosaic', true, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.shouldDrawCell).toBe(true);
      });
    });

    // --- artwork ---
    describe('artwork mode', () => {
      it('isDark=true → pure fg color, no effects', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('artwork', true, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.shouldDrawCell).toBe(true);
        expect(result.moduleColor).toBe('#000000');
        expect(result.moduleSizeModifier).toBe(1);
        expect(result.drawOutlineOnly).toBe(false);
        expect(result.useHalftoneRendering).toBe(false);
      });

      it('isDark=false → pure bg color', async () => {
        const { applyQROverlayMode } = await import('../../src/modules/qr-generator/render-modes');
        const result = applyQROverlayMode('artwork', false, 0.5, {}, 5, 5, 21, 0.8, makeConfig());
        expect(result.shouldDrawCell).toBe(false);
        expect(result.moduleColor).toBe('#ffffff');
      });
    });
  });
});
