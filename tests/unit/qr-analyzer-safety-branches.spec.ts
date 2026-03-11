// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockScanCanvas = vi.fn();
vi.mock('../../src/modules/qr-analyzer/scanner', () => ({
  scanCanvas: (...args: unknown[]) => mockScanCanvas(...args),
}));

import {
  analyzeContrast,
  analyzeMatrixContrast,
  analyzeQR,
  applyBlurSimulation,
  applyNoiseSimulation,
  calculateSafeIntensity,
  generateReadabilityHeatmap,
  simulateScan,
  validateModuleSize,
  validateOverlayIntensity,
  validateQuietZone,
} from '../../src/modules/qr-analyzer/safety';

describe('qr-analyzer/safety.ts branch coverage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockScanCanvas.mockReset();
  });

  describe('analyzeContrast', () => {
    it('black on white → high contrast, meets AA and AAA', () => {
      const report = analyzeContrast('#000000', '#ffffff');
      expect(report.ratio).toBeGreaterThan(10);
      expect(report.meetsAA).toBe(true);
      expect(report.meetsAAA).toBe(true);
      expect(report.fgLuminance).toBeCloseTo(0, 2);
      expect(report.bgLuminance).toBeCloseTo(1, 2);
    });

    it('white on white → ratio ~1, fails both', () => {
      const report = analyzeContrast('#ffffff', '#ffffff');
      expect(report.ratio).toBeCloseTo(1, 0);
      expect(report.meetsAA).toBe(false);
      expect(report.meetsAAA).toBe(false);
    });

    it('invalid fg color → guard returns defaults', () => {
      const report = analyzeContrast('not-a-color', '#ffffff');
      expect(report.ratio).toBe(1);
      expect(report.meetsAA).toBe(false);
      expect(report.meetsAAA).toBe(false);
      expect(report.fgLuminance).toBe(0);
      expect(report.bgLuminance).toBe(0);
    });

    it('invalid bg color → guard returns defaults', () => {
      const report = analyzeContrast('#000000', 'xyz');
      expect(report.ratio).toBe(1);
      expect(report.meetsAA).toBe(false);
      expect(report.meetsAAA).toBe(false);
      expect(report.fgLuminance).toBe(0);
      expect(report.bgLuminance).toBe(0);
    });

    it('both invalid → guard returns defaults', () => {
      const report = analyzeContrast('xyz', 'abc');
      expect(report.ratio).toBe(1);
      expect(report.meetsAA).toBe(false);
      expect(report.meetsAAA).toBe(false);
    });

    it('dark red on white → hits luminance > 0.03928 branch for R, <= branch for G/B', () => {
      // #800000: r=128, g=0, b=0
      // rsRGB = 128/255 ≈ 0.502 > 0.03928 (uses power formula for R)
      // gsRGB = 0/255 = 0 <= 0.03928 (uses linear formula for G)
      // bsRGB = 0/255 = 0 <= 0.03928 (uses linear formula for B)
      const report = analyzeContrast('#800000', '#ffffff');
      expect(report.ratio).toBeGreaterThan(1);
      expect(report.fgLuminance).toBeGreaterThan(0);
      expect(report.fgLuminance).toBeLessThan(0.1);
    });

    it('very dark grey on white → all channels in <= 0.03928 branch', () => {
      // #090909: r=9, g=9, b=9
      // rsRGB = 9/255 ≈ 0.0353 <= 0.03928 (uses linear formula)
      const report = analyzeContrast('#090909', '#ffffff');
      expect(report.ratio).toBeGreaterThan(10);
      expect(report.fgLuminance).toBeLessThan(0.01);
    });

    it('light grey on dark grey → intermediate contrast', () => {
      const report = analyzeContrast('#333333', '#cccccc');
      expect(report.ratio).toBeGreaterThan(1);
      expect(report.meetsAA).toBe(true);
    });

    it('meets AA but not AAA', () => {
      // Need contrast between 4.5 and 7
      // #767676 on white ≈ 4.54:1 (just above AA threshold)
      const report = analyzeContrast('#767676', '#ffffff');
      expect(report.ratio).toBeGreaterThanOrEqual(4.5);
      expect(report.ratio).toBeLessThan(7);
      expect(report.meetsAA).toBe(true);
      expect(report.meetsAAA).toBe(false);
    });
  });

  describe('analyzeMatrixContrast', () => {
    it('delegates to analyzeContrast', () => {
      const matrix = [
        [true, false],
        [false, true],
      ];
      const report = analyzeMatrixContrast(matrix, '#000000', '#ffffff');
      expect(report.ratio).toBeGreaterThan(10);
      expect(report.meetsAA).toBe(true);
    });
  });

  describe('calculateSafeIntensity', () => {
    it('returns 30 for L', () => expect(calculateSafeIntensity('L')).toBe(30));
    it('returns 50 for M', () => expect(calculateSafeIntensity('M')).toBe(50));
    it('returns 70 for Q', () => expect(calculateSafeIntensity('Q')).toBe(70));
    it('returns 85 for H', () => expect(calculateSafeIntensity('H')).toBe(85));

    it('returns default 50 for unknown ECC level', () => {
      expect(calculateSafeIntensity('X')).toBe(50);
      expect(calculateSafeIntensity('')).toBe(50);
    });
  });

  describe('validateModuleSize', () => {
    it('below min → invalid with warning', () => {
      const result = validateModuleSize(3, 4);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('3px');
      expect(result.warning).toContain('4px');
    });

    it('at min → valid', () => {
      const result = validateModuleSize(4, 4);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('above min → valid', () => {
      const result = validateModuleSize(8, 4);
      expect(result.valid).toBe(true);
    });

    it('uses default min of 4 when not specified', () => {
      expect(validateModuleSize(3).valid).toBe(false);
      expect(validateModuleSize(4).valid).toBe(true);
    });
  });

  describe('validateQuietZone', () => {
    it('below min → invalid with warning', () => {
      const result = validateQuietZone(2, 4);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('2 modules');
      expect(result.warning).toContain('4 modules');
    });

    it('at min → valid', () => {
      const result = validateQuietZone(4, 4);
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('above min → valid', () => {
      expect(validateQuietZone(6, 4).valid).toBe(true);
    });

    it('uses default min of 4 when not specified', () => {
      expect(validateQuietZone(3).valid).toBe(false);
      expect(validateQuietZone(4).valid).toBe(true);
    });
  });

  describe('validateOverlayIntensity', () => {
    it('at exactly safe limit → valid', () => {
      expect(validateOverlayIntensity(30, 'L').valid).toBe(true);
      expect(validateOverlayIntensity(50, 'M').valid).toBe(true);
      expect(validateOverlayIntensity(70, 'Q').valid).toBe(true);
      expect(validateOverlayIntensity(85, 'H').valid).toBe(true);
    });

    it('one above safe limit → invalid with warning', () => {
      const result = validateOverlayIntensity(31, 'L');
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('31%');
      expect(result.warning).toContain('30%');
      expect(result.warning).toContain('L');
    });

    it('unknown ECC → uses default limit of 50', () => {
      expect(validateOverlayIntensity(50, 'X').valid).toBe(true);
      expect(validateOverlayIntensity(51, 'X').valid).toBe(false);
    });

    it('zero intensity → always valid', () => {
      expect(validateOverlayIntensity(0, 'L').valid).toBe(true);
    });
  });

  describe('DOM-dependent functions with canvas context', () => {
    let mockCtx: Record<string, unknown>;

    beforeEach(() => {
      mockCtx = {
        filter: '',
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray([
            0,
            0,
            0,
            255, // pixel 0: dark (brightness 0)
            255,
            255,
            255,
            255, // pixel 1: light (brightness 255)
            100,
            50,
            50,
            255, // pixel 2: dark-ish (brightness ~67)
            200,
            200,
            200,
            255, // pixel 3: light (brightness 200)
          ]),
          width: 2,
          height: 2,
        })),
        putImageData: vi.fn(),
      };

      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        mockCtx as unknown as CanvasRenderingContext2D
      );
    });

    describe('applyBlurSimulation', () => {
      it('returns a new canvas with same dimensions', () => {
        const input = document.createElement('canvas');
        input.width = 20;
        input.height = 15;

        const result = applyBlurSimulation(input, 3);
        expect(result).not.toBe(input);
        expect(result.width).toBe(20);
        expect(result.height).toBe(15);
      });

      it('sets blur filter and draws image when context is available', () => {
        const input = document.createElement('canvas');
        input.width = 10;
        input.height = 10;

        applyBlurSimulation(input, 5);
        expect(mockCtx.filter).toBe('blur(5px)');
        expect(mockCtx.drawImage).toHaveBeenCalledWith(input, 0, 0);
      });
    });

    describe('applyNoiseSimulation', () => {
      it('modifies pixel data with noise', () => {
        // Set up specific pixel data for noise testing
        (mockCtx.getImageData as ReturnType<typeof vi.fn>).mockReturnValue({
          data: new Uint8ClampedArray([100, 100, 100, 255, 100, 100, 100, 255]),
          width: 2,
          height: 1,
        });

        // Mock crypto.getRandomValues for deterministic noise
        vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr) => {
          const u8 = arr as Uint8Array;
          for (let i = 0; i < u8.length; i++) u8[i] = 204; // 204/255 ≈ 0.8
          return arr;
        });

        const input = document.createElement('canvas');
        input.width = 2;
        input.height = 1;

        const result = applyNoiseSimulation(input, 0.1);
        expect(result).not.toBe(input);
        expect(mockCtx.putImageData).toHaveBeenCalledTimes(1);
      });

      it('clamps pixel values to [0, 255]', () => {
        let callIdx = 0;
        vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr) => {
          const u8 = arr as Uint8Array;
          for (let i = 0; i < u8.length; i++) {
            // Alternate: 255 (max positive noise) and 0 (max negative noise)
            u8[i] = callIdx++ % 2 === 0 ? 255 : 0;
          }
          return arr;
        });

        (mockCtx.getImageData as ReturnType<typeof vi.fn>).mockReturnValue({
          data: new Uint8ClampedArray([250, 250, 250, 255, 5, 5, 5, 255]),
          width: 2,
          height: 1,
        });

        const input = document.createElement('canvas');
        input.width = 2;
        input.height = 1;

        applyNoiseSimulation(input, 0.5);
        expect(mockCtx.putImageData).toHaveBeenCalledTimes(1);

        const resultData = (mockCtx.putImageData as ReturnType<typeof vi.fn>).mock.calls[0][0].data;
        // Pixel 0: 250 + positive noise → clamped to 255
        expect(resultData[0]).toBe(255);
        // Pixel 1: 5 + negative noise → clamped to 0
        expect(resultData[4]).toBe(0);
      });
    });

    describe('generateReadabilityHeatmap', () => {
      it('maps dark pixels to green and light pixels to red', () => {
        const input = document.createElement('canvas');
        input.width = 2;
        input.height = 2;

        const result = generateReadabilityHeatmap(input);
        expect(result).not.toBe(input); // Returns a new canvas

        expect(mockCtx.putImageData).toHaveBeenCalledTimes(1);
        const resultData = (mockCtx.putImageData as ReturnType<typeof vi.fn>).mock.calls[0][0].data;

        // Pixel 0 (brightness 0 < 128) → green
        expect(resultData[0]).toBe(0); // R
        expect(resultData[1]).toBe(255); // G
        expect(resultData[2]).toBe(0); // B
        expect(resultData[3]).toBe(128); // A (semi-transparent)

        // Pixel 1 (brightness 255 >= 128) → red
        expect(resultData[4]).toBe(255); // R
        expect(resultData[5]).toBe(0); // G
        expect(resultData[6]).toBe(0); // B
        expect(resultData[7]).toBe(128); // A

        // Pixel 2 (brightness ~67 < 128) → green
        expect(resultData[8]).toBe(0);
        expect(resultData[9]).toBe(255);
        expect(resultData[10]).toBe(0);
        expect(resultData[11]).toBe(128);

        // Pixel 3 (brightness 200 >= 128) → red
        expect(resultData[12]).toBe(255);
        expect(resultData[13]).toBe(0);
        expect(resultData[14]).toBe(0);
        expect(resultData[15]).toBe(128);
      });
    });

    describe('simulateScan', () => {
      it('ideal → scans directly without transform', () => {
        mockScanCanvas.mockReturnValue({ data: 'hello' });
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'hello', 'ideal');
        expect(result.success).toBe(true);
        expect(result.data).toBe('hello');
        expect(result.confidence).toBe(1);
        expect(result.conditions).toBe('ideal');
      });

      it('ideal → default parameter when not specified', () => {
        mockScanCanvas.mockReturnValue({ data: 'hello' });
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'hello');
        expect(result.conditions).toBe('ideal');
        expect(result.success).toBe(true);
      });

      it('blur → applies blur simulation before scanning', () => {
        mockScanCanvas.mockReturnValue({ data: 'test' });
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'test', 'blur');
        expect(result.success).toBe(true);
        expect(result.conditions).toBe('blur');
        // Verify blur filter was applied
        expect(mockCtx.filter).toBe('blur(2px)');
      });

      it('noise → applies noise simulation before scanning', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        mockScanCanvas.mockReturnValue({ data: 'test' });
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'test', 'noise');
        expect(result.success).toBe(true);
        expect(result.conditions).toBe('noise');
        expect(mockCtx.putImageData).toHaveBeenCalled();
      });

      it('low_light → applies both blur and noise', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        mockScanCanvas.mockReturnValue({ data: 'test' });
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'test', 'low_light');
        expect(result.success).toBe(true);
        expect(result.conditions).toBe('low_light');
      });

      it('scan fails → success=false, data=null, confidence=0', () => {
        mockScanCanvas.mockReturnValue(null);
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'test', 'ideal');
        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.confidence).toBe(0);
      });

      it('scan succeeds but content mismatch → success=false', () => {
        mockScanCanvas.mockReturnValue({ data: 'wrong' });
        const input = document.createElement('canvas');

        const result = simulateScan(input, 'expected', 'ideal');
        expect(result.success).toBe(false);
        expect(result.data).toBe('wrong');
        expect(result.confidence).toBe(0);
      });
    });

    describe('analyzeQR', () => {
      it('scan fails → valid=false, scan_failed issue', () => {
        mockScanCanvas.mockReturnValue(null);
        const input = document.createElement('canvas');

        const result = analyzeQR(input);
        expect(result.valid).toBe(false);
        expect(result.scannable).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].type).toBe('scan_failed');
        expect(result.issues[0].message).toContain('could not be scanned');
      });

      it('scan succeeds, no expectedContent → valid=true', () => {
        mockScanCanvas.mockReturnValue({ data: 'anything' });
        const input = document.createElement('canvas');

        const result = analyzeQR(input);
        expect(result.valid).toBe(true);
        expect(result.scannable).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('scan succeeds, expectedContent matches → valid=true', () => {
        mockScanCanvas.mockReturnValue({ data: 'hello' });
        const input = document.createElement('canvas');

        const result = analyzeQR(input, 'hello');
        expect(result.valid).toBe(true);
        expect(result.scannable).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('scan succeeds, expectedContent does not match → valid=false, content_mismatch', () => {
        mockScanCanvas.mockReturnValue({ data: 'wrong' });
        const input = document.createElement('canvas');

        const result = analyzeQR(input, 'expected');
        expect(result.valid).toBe(false);
        expect(result.scannable).toBe(true);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].type).toBe('content_mismatch');
        expect(result.issues[0].message).toContain('wrong');
      });

      it('returns null contrast, moduleSize, quietZone', () => {
        mockScanCanvas.mockReturnValue({ data: 'test' });
        const input = document.createElement('canvas');

        const result = analyzeQR(input, 'test');
        expect(result.contrast).toBeNull();
        expect(result.moduleSize).toBeNull();
        expect(result.quietZone).toBeNull();
        expect(result.warnings).toHaveLength(0);
      });
    });
  });

  describe('DOM-dependent functions without canvas context', () => {
    beforeEach(() => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    });

    it('applyBlurSimulation returns canvas without error when ctx is null', () => {
      const input = document.createElement('canvas');
      input.width = 10;
      input.height = 10;

      const result = applyBlurSimulation(input, 3);
      // Returns the newly created result canvas (not the input)
      expect(result).not.toBe(input);
      expect(result.width).toBe(10);
      expect(result.height).toBe(10);
    });

    it('applyNoiseSimulation returns original canvas when ctx is null', () => {
      const input = document.createElement('canvas');
      input.width = 10;
      input.height = 10;

      const result = applyNoiseSimulation(input, 0.1);
      expect(result).toBe(input);
    });

    it('generateReadabilityHeatmap returns original when result ctx is null', () => {
      const input = document.createElement('canvas');
      input.width = 10;
      input.height = 10;

      const result = generateReadabilityHeatmap(input);
      expect(result).toBe(input);
    });

    it('generateReadabilityHeatmap returns original when source ctx is null', () => {
      const mockCtx = {
        filter: '',
        drawImage: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
      };

      // First call (result canvas) returns ctx, second call (source) returns null
      const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
      spy.mockReturnValueOnce(mockCtx as unknown as CanvasRenderingContext2D);
      spy.mockReturnValueOnce(null);

      const input = document.createElement('canvas');
      input.width = 10;
      input.height = 10;

      const result = generateReadabilityHeatmap(input);
      expect(result).toBe(input);
      // getImageData should NOT have been called since sourceCtx is null
      expect(mockCtx.getImageData).not.toHaveBeenCalled();
    });
  });
});
