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

// ============================================================================
// qr-analyzer/safety.ts
// ============================================================================
describe('qr-analyzer/safety.ts', () => {
  describe('analyzeContrast', () => {
    async function getAnalyzeContrast() {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      return mod.analyzeContrast;
    }

    it('returns high contrast for black on white', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      const result = analyzeContrast('#000000', '#ffffff');
      expect(result.ratio).toBeGreaterThan(20);
      expect(result.meetsAA).toBe(true);
      expect(result.meetsAAA).toBe(true);
      expect(result.fgLuminance).toBeCloseTo(0, 1);
      expect(result.bgLuminance).toBeCloseTo(1, 1);
    });

    it('returns ratio 1 for same color', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      const result = analyzeContrast('#ff0000', '#ff0000');
      expect(result.ratio).toBeCloseTo(1, 0);
      expect(result.meetsAA).toBe(false);
      expect(result.meetsAAA).toBe(false);
    });

    it('returns guard defaults for invalid fg color (parseColor returns null)', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      const result = analyzeContrast('invalid', '#ffffff');
      expect(result.ratio).toBe(1);
      expect(result.meetsAA).toBe(false);
      expect(result.meetsAAA).toBe(false);
      expect(result.fgLuminance).toBe(0);
      expect(result.bgLuminance).toBe(0);
    });

    it('returns guard defaults for invalid bg color (parseColor returns null)', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      const result = analyzeContrast('#000000', 'notacolor');
      expect(result.ratio).toBe(1);
      expect(result.meetsAA).toBe(false);
      expect(result.fgLuminance).toBe(0);
      expect(result.bgLuminance).toBe(0);
    });

    it('returns guard defaults when both colors invalid', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      const result = analyzeContrast('bad', 'worse');
      expect(result.ratio).toBe(1);
      expect(result.meetsAA).toBe(false);
    });

    it('calculates mid-contrast colors correctly', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      // Dark gray on light gray
      const result = analyzeContrast('#333333', '#cccccc');
      expect(result.ratio).toBeGreaterThan(1);
      expect(result.ratio).toBeLessThan(21);
      expect(result.fgLuminance).toBeLessThan(result.bgLuminance);
    });

    it('works with colors near AA threshold (4.5)', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      // These colors have contrast around 4.5
      const result = analyzeContrast('#767676', '#ffffff');
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      expect(result.meetsAA).toBe(true);
    });

    it('handles reversed order (light fg, dark bg)', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      const result = analyzeContrast('#ffffff', '#000000');
      expect(result.ratio).toBeGreaterThan(20);
      expect(result.meetsAA).toBe(true);
      expect(result.meetsAAA).toBe(true);
    });

    it('calculates luminance using WCAG formula (sRGB linearization)', async () => {
      const analyzeContrast = await getAnalyzeContrast();
      // Pure red
      const result = analyzeContrast('#ff0000', '#000000');
      // Red luminance = 0.2126 * 1.0 + 0.7152 * 0 + 0.0722 * 0 = 0.2126
      expect(result.fgLuminance).toBeCloseTo(0.2126, 2);
    });
  });

  describe('analyzeMatrixContrast', () => {
    it('delegates to analyzeContrast', async () => {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      const matrix = [
        [true, false],
        [false, true],
      ];
      const result = mod.analyzeMatrixContrast(matrix, '#000000', '#ffffff');
      expect(result.ratio).toBeGreaterThan(20);
      expect(result.meetsAA).toBe(true);
    });
  });

  describe('calculateSafeIntensity', () => {
    async function getCalcSafe() {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      return mod.calculateSafeIntensity;
    }

    it('returns 30 for L', async () => {
      const fn = await getCalcSafe();
      expect(fn('L')).toBe(30);
    });

    it('returns 50 for M', async () => {
      const fn = await getCalcSafe();
      expect(fn('M')).toBe(50);
    });

    it('returns 70 for Q', async () => {
      const fn = await getCalcSafe();
      expect(fn('Q')).toBe(70);
    });

    it('returns 85 for H', async () => {
      const fn = await getCalcSafe();
      expect(fn('H')).toBe(85);
    });

    it('returns 50 for unknown level', async () => {
      const fn = await getCalcSafe();
      expect(fn('X')).toBe(50);
      expect(fn('')).toBe(50);
    });
  });

  describe('validateModuleSize', () => {
    async function getValidate() {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      return mod.validateModuleSize;
    }

    it('returns valid for size >= 4 (default minSize)', async () => {
      const fn = await getValidate();
      expect(fn(4)).toEqual({ valid: true });
      expect(fn(10)).toEqual({ valid: true });
      expect(fn(100)).toEqual({ valid: true });
    });

    it('returns invalid for size < 4 (default minSize)', async () => {
      const fn = await getValidate();
      const result = fn(3);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('3px');
      expect(result.warning).toContain('4px');
    });

    it('uses custom minSize', async () => {
      const fn = await getValidate();
      expect(fn(2, 2).valid).toBe(true);
      expect(fn(1, 2).valid).toBe(false);
    });

    it('returns invalid for size 0', async () => {
      const fn = await getValidate();
      expect(fn(0).valid).toBe(false);
    });

    it('returns valid for exact boundary', async () => {
      const fn = await getValidate();
      expect(fn(4, 4).valid).toBe(true);
    });
  });

  describe('validateQuietZone', () => {
    async function getValidate() {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      return mod.validateQuietZone;
    }

    it('returns valid for zone >= 4 (default minModules)', async () => {
      const fn = await getValidate();
      expect(fn(4)).toEqual({ valid: true });
      expect(fn(8)).toEqual({ valid: true });
    });

    it('returns invalid for zone < 4 (default minModules)', async () => {
      const fn = await getValidate();
      const result = fn(3);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('3');
      expect(result.warning).toContain('4');
    });

    it('uses custom minModules', async () => {
      const fn = await getValidate();
      expect(fn(2, 2).valid).toBe(true);
      expect(fn(1, 2).valid).toBe(false);
    });

    it('returns invalid for zone 0', async () => {
      const fn = await getValidate();
      expect(fn(0).valid).toBe(false);
    });
  });

  describe('validateOverlayIntensity', () => {
    async function getValidate() {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      return mod.validateOverlayIntensity;
    }

    it('returns valid when within safe limit for L', async () => {
      const fn = await getValidate();
      expect(fn(30, 'L').valid).toBe(true);
      expect(fn(20, 'L').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for L', async () => {
      const fn = await getValidate();
      const result = fn(31, 'L');
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('31%');
      expect(result.warning).toContain('30%');
    });

    it('returns valid when within safe limit for M', async () => {
      const fn = await getValidate();
      expect(fn(50, 'M').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for M', async () => {
      const fn = await getValidate();
      expect(fn(51, 'M').valid).toBe(false);
    });

    it('returns valid when within safe limit for Q', async () => {
      const fn = await getValidate();
      expect(fn(70, 'Q').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for Q', async () => {
      const fn = await getValidate();
      expect(fn(71, 'Q').valid).toBe(false);
    });

    it('returns valid when within safe limit for H', async () => {
      const fn = await getValidate();
      expect(fn(85, 'H').valid).toBe(true);
    });

    it('returns invalid when exceeding safe limit for H', async () => {
      const fn = await getValidate();
      expect(fn(86, 'H').valid).toBe(false);
    });

    it('uses fallback limit (50) for unknown ECC level', async () => {
      const fn = await getValidate();
      expect(fn(50, 'X').valid).toBe(true);
      expect(fn(51, 'X').valid).toBe(false);
    });
  });

  describe('SafetyAnalyzer namespace', () => {
    it('exposes all expected methods', async () => {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      const sa = mod.SafetyAnalyzer;

      expect(typeof sa.analyzeContrast).toBe('function');
      expect(typeof sa.analyzeMatrixContrast).toBe('function');
      expect(typeof sa.analyzeQR).toBe('function');
      expect(typeof sa.applyBlurSimulation).toBe('function');
      expect(typeof sa.applyNoiseSimulation).toBe('function');
      expect(typeof sa.calculateSafeIntensity).toBe('function');
      expect(typeof sa.generateReadabilityHeatmap).toBe('function');
      expect(typeof sa.simulateScan).toBe('function');
      expect(typeof sa.validateModuleSize).toBe('function');
      expect(typeof sa.validateOverlayIntensity).toBe('function');
      expect(typeof sa.validateQuietZone).toBe('function');
    });

    it('default export is the same as SafetyAnalyzer', async () => {
      const mod = await import('../../src/modules/qr-analyzer/safety');
      expect(mod.default).toBe(mod.SafetyAnalyzer);
    });
  });
});

// ============================================================================
// qr-analyzer/scanner.ts
// ============================================================================
describe('qr-analyzer/scanner.ts', () => {
  describe('scanImageData', () => {
    async function getScanImageData() {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      return mod.scanImageData;
    }

    it('returns null data for blank white ImageData', async () => {
      const scanImageData = await getScanImageData();
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
      const imgData = new MockImageData(data, size, size);
      const result = scanImageData(imgData as unknown as ImageData);
      expect(result.data).toBeNull();
      expect(result.location).toBeNull();
    });

    it('returns null data for blank black ImageData', async () => {
      const scanImageData = await getScanImageData();
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
      const imgData = new MockImageData(data, size, size);
      const result = scanImageData(imgData as unknown as ImageData);
      expect(result.data).toBeNull();
      expect(result.location).toBeNull();
    });

    it('returns null data for very small ImageData', async () => {
      const scanImageData = await getScanImageData();
      const imgData = new MockImageData(1, 1);
      const result = scanImageData(imgData as unknown as ImageData);
      expect(result.data).toBeNull();
    });

    it('handles uniform gray ImageData', async () => {
      const scanImageData = await getScanImageData();
      const size = 50;
      const data = new Uint8ClampedArray(size * size * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
      const imgData = new MockImageData(data, size, size);
      const result = scanImageData(imgData as unknown as ImageData);
      expect(result.data).toBeNull();
    });
  });

  describe('scanCanvas', () => {
    async function getScanCanvas() {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      return mod.scanCanvas;
    }

    it('returns null data when canvas has no 2d context', async () => {
      const scanCanvas = await getScanCanvas();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = scanCanvas(canvas);
      expect(result.data).toBeNull();
      expect(result.location).toBeNull();
    });

    it('returns null data when canvas contains blank image', async () => {
      const scanCanvas = await getScanCanvas();
      const size = 100;
      const imgData = new MockImageData(size, size);
      // Fill white
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255;
        imgData.data[i + 1] = 255;
        imgData.data[i + 2] = 255;
        imgData.data[i + 3] = 255;
      }

      const canvas = {
        width: size,
        height: size,
        getContext: vi.fn(() => ({
          getImageData: vi.fn(() => imgData),
        })),
      } as unknown as HTMLCanvasElement;

      const result = scanCanvas(canvas);
      expect(result.data).toBeNull();
    });
  });

  describe('validateQRCode', () => {
    async function getValidate() {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      return mod.validateQRCode;
    }

    it('returns valid=false, confidence=low when scan fails (no 2d ctx)', async () => {
      const validate = await getValidate();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = validate(canvas);
      expect(result.valid).toBe(false);
      expect(result.confidence).toBe('low');
      expect(result.error).toContain('No QR code detected');
    });

    it('returns valid=false, confidence=low for blank canvas', async () => {
      const validate = await getValidate();
      const size = 100;
      const imgData = new MockImageData(size, size);
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255;
        imgData.data[i + 1] = 255;
        imgData.data[i + 2] = 255;
        imgData.data[i + 3] = 255;
      }

      const canvas = {
        width: size,
        height: size,
        getContext: vi.fn(() => ({
          getImageData: vi.fn(() => imgData),
        })),
      } as unknown as HTMLCanvasElement;

      const result = validate(canvas);
      expect(result.valid).toBe(false);
      expect(result.confidence).toBe('low');
    });

    it('returns valid=false for no expected content match (no QR found)', async () => {
      const validate = await getValidate();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = validate(canvas, 'expected content');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateQRCodeRobust', () => {
    async function getValidateRobust() {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      return mod.validateQRCodeRobust;
    }

    it('returns valid=false after all attempts fail', async () => {
      const validate = await getValidateRobust();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = validate(canvas, undefined, 3);
      expect(result.valid).toBe(false);
      expect(result.confidence).toBe('low');
      expect(result.error).toContain('multiple attempts');
    });

    it('returns valid=false after single attempt fails', async () => {
      const validate = await getValidateRobust();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = validate(canvas, undefined, 1);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFrames', () => {
    async function getValidateFrames() {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      return mod.validateFrames;
    }

    it('returns valid=true and counts for empty frames array', async () => {
      const validate = await getValidateFrames();
      const result = validate([]);
      expect(result.valid).toBe(true);
      expect(result.validCount).toBe(0);
      expect(result.totalCount).toBe(0);
    });

    it('counts failed validations for blank canvases', async () => {
      const validate = await getValidateFrames();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = validate([canvas, canvas, canvas]);
      expect(result.valid).toBe(false);
      expect(result.validCount).toBe(0);
      expect(result.totalCount).toBe(3);
    });

    it('handles single frame', async () => {
      const validate = await getValidateFrames();
      const canvas = {
        getContext: vi.fn(() => null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const result = validate([canvas]);
      expect(result.totalCount).toBe(1);
    });
  });

  describe('QRScanner namespace', () => {
    it('exposes all expected methods', async () => {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      const scanner = mod.QRScanner;

      expect(typeof scanner.scanCanvas).toBe('function');
      expect(typeof scanner.scanFile).toBe('function');
      expect(typeof scanner.scanImageData).toBe('function');
      expect(typeof scanner.validateQRCode).toBe('function');
      expect(typeof scanner.validateQRCodeRobust).toBe('function');
      expect(typeof scanner.validateFrames).toBe('function');
    });

    it('default export is the same as QRScanner', async () => {
      const mod = await import('../../src/modules/qr-analyzer/scanner');
      expect(mod.default).toBe(mod.QRScanner);
    });
  });
});
