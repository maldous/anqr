import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
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

// ======================================================================
// Mock helpers
// ======================================================================

/** Create a mock QR code instance with a checkerboard pattern */
function createMockQr(moduleCount: number) {
  return {
    isDark: (row: number, col: number) => (row + col) % 2 === 0,
    getModuleCount: () => moduleCount,
  };
}

/** Checkerboard QR mock but with spec fixed-dark module forced to true */
function createMockQrWithFixedDark(moduleCount: number) {
  return {
    isDark: (row: number, col: number) =>
      row === moduleCount - 8 && col === 8 ? true : (row + col) % 2 === 0,
    getModuleCount: () => moduleCount,
  };
}

/** Create an all-dark QR mock (every module is dark) */
function createAllDarkQr(moduleCount: number) {
  return {
    isDark: () => true,
    getModuleCount: () => moduleCount,
  };
}

/** Fill pixel data with a uniform RGBA value */
function fillUniform(data: Uint8ClampedArray, r: number, g: number, b: number, a = 255) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }
}

/** Fill pixel data with alternating black/white (bimodal BW image) */
function fillBW(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const val = (i / 4) % 2 === 0 ? 0 : 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
}

/** Fill pixel data with varied colors */
function fillColorful(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const pixel = i / 4;
    data[i] = (pixel * 37) % 256;
    data[i + 1] = (pixel * 73) % 256;
    data[i + 2] = (pixel * 131) % 256;
    data[i + 3] = 255;
  }
}

type PixelFiller = (data: Uint8ClampedArray) => void;

/**
 * Create a createCanvasFn mock. Each call creates a new canvas whose
 * getImageData returns pixel data produced by `filler`.
 */
function mockCreateCanvasFn(filler: PixelFiller) {
  return async (w: number, h: number) => {
    const data = new Uint8ClampedArray(w * h * 4);
    filler(data);
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data, width: w, height: h })),
      putImageData: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high' as const,
      fillStyle: '',
      fillRect: vi.fn(),
    };
    return {
      width: w,
      height: h,
      getContext: vi.fn(() => ctx),
    } as unknown as HTMLCanvasElement;
  };
}

function countDarkInModule(matrix: boolean[][], scale: number, moduleRow: number, moduleCol: number): number {
  let dark = 0;
  const y0 = moduleRow * scale;
  const x0 = moduleCol * scale;
  for (let y = y0; y < y0 + scale; y++) {
    for (let x = x0; x < x0 + scale; x++) {
      if (matrix[y]?.[x]) dark++;
    }
  }
  return dark;
}

/** Create a createCanvasFn that returns null ctx (for error paths) */
function mockCreateCanvasFnNullCtx() {
  return async (w: number, h: number) => {
    return {
      width: w,
      height: h,
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;
  };
}

/** Create an overlay canvas mock */
function createOverlayCanvas(w = 100, h = 100): HTMLCanvasElement {
  return {
    width: w,
    height: h,
    getContext: vi.fn(() => null),
  } as unknown as HTMLCanvasElement;
}

/** Minimal QR generator config with reasonable defaults */
function baseConfig(overrides: Record<string, unknown> = {}) {
  return {
    typeNumber: 1,
    moduleSize: 10,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
    transparentBg: false,
    blueNoiseSeed: 42,
    blueNoiseTileSize: 64,
    ditherStrength: 50,
    ditherSerpentine: false,
    colorDither: 'none',
    diffusionKernel: 'floyd_steinberg',
    colorMode: 'color',
    qrFirstMode: false,
    preserveFinders: true,
    preserveTiming: false,
    preserveAlignment: false,
    protectFormatInfo: false,
    protectVersionInfo: false,
    debugOverlayDither: false,
    ...overrides,
  };
}

describe('qr-generator/pixel-matrix-dithered.ts', () => {
  // ================================================================
  // generateDitheredMatrix
  // ================================================================
  describe('generateDitheredMatrix', () => {
    async function getDithered() {
      const mod = await import('../../src/modules/qr-generator/pixel-matrix-dithered');
      return mod.generateDitheredMatrix;
    }

    it('generates matrix with standard grayscale dithering (non-BW overlay)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 3;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result).toBeDefined();
      expect(result.matrix).toBeDefined();
      expect(result.matrix.length).toBe(moduleCount * scale);
      expect(result.colors).toBeDefined();
      expect(result.scale).toBe(scale);
    });

    it('uses QR-first mode when config.qrFirstMode is true', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ qrFirstMode: true, colorMode: 'bw' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
      // In BW mode, colors should be null
      const firstNonNull = result.colors.flat().find((c) => c !== null);
      expect(firstNonNull).toBeUndefined();
    });

    it('uses QR-first mode when config.qrFirstMode is true with color mode', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ qrFirstMode: true, colorMode: 'color' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 100, 150, 200));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
      // In color mode, BW-first should still set shade values as colors
      const someColor = result.colors.flat().find((c) => c !== null);
      expect(someColor).toBeDefined();
    });

    it('auto-detects high-contrast BW overlay and uses QR-first mode', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();
      // BW image → bimodal histogram → auto-detect triggers
      const createCanvas = mockCreateCanvasFn((d) => fillBW(d));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.8,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('handles null ctx from createCanvasFn (returns empty matrix)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ qrFirstMode: true });
      const overlay = createOverlayCanvas();

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        mockCreateCanvasFnNullCtx()
      );

      // Should return empty matrix (all false, all null colors)
      expect(result.matrix.length).toBe(moduleCount * scale);
      for (const row of result.matrix) {
        for (const val of row) {
          expect(val).toBe(false);
        }
      }
    });

    it('generates with color dithering enabled (colorDither != none)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ colorDither: 'full' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillColorful(d));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
      // Color dither should produce colored output
      const someColor = result.colors.flat().find((c) => c !== null);
      expect(someColor).toBeDefined();
    });

    it('generates with serpentine scanning enabled', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ ditherSerpentine: true });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('generates with serpentine + color dither together', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ ditherSerpentine: true, colorDither: 'full' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillColorful(d));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('exercises shouldLockModule branches (preserveFinders, timing, alignment, format, version)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);

      // All protections enabled
      const config = baseConfig({
        preserveFinders: true,
        preserveTiming: true,
        preserveAlignment: true,
        protectFormatInfo: true,
        protectVersionInfo: true,
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('does not hard-lock finder modules when preserveFinders=false', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 8;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ preserveFinders: false });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
      // Top-left finder module (0,0) should not be forced fully to QR bit when finder protection is off.
      // With locking on and checkerboard mock QR, this module would be fully dark (64/64).
      const darkCount = countDarkInModule(result.matrix, scale, 0, 0);
      expect(darkCount).toBeGreaterThan(0);
      expect(darkCount).toBeLessThan(scale * scale);
    });

    it('keeps finder modules locked when preserveFinders=true', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 8;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ preserveFinders: true });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      const darkCount = countDarkInModule(result.matrix, scale, 0, 0);
      expect(darkCount).toBe(scale * scale);
    });

    it('does not hard-lock timing modules when preserveTiming=false', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 8;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ preserveTiming: false });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      // Timing module at (6,8) should not be forced fully to QR bit when preserveTiming is off.
      const darkCount = countDarkInModule(result.matrix, scale, 6, 8);
      expect(darkCount).toBeGreaterThan(0);
      expect(darkCount).toBeLessThan(scale * scale);
    });

    it('keeps timing modules locked when preserveTiming=true', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 8;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ preserveTiming: true });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      const darkCount = countDarkInModule(result.matrix, scale, 6, 8);
      expect(darkCount).toBe(scale * scale);
    });

    it('does not hard-lock fixed dark module when all preserve/protect toggles are off', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 8;
      const qr = createMockQrWithFixedDark(moduleCount);
      const config = baseConfig({
        preserveFunctionalPatterns: false,
        preserveFinders: false,
        preserveTiming: false,
        preserveAlignment: false,
        protectFormatInfo: false,
        protectVersionInfo: false,
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      const darkCount = countDarkInModule(result.matrix, scale, moduleCount - 8, 8);
      expect(darkCount).toBeGreaterThan(0);
      expect(darkCount).toBeLessThan(scale * scale);
    });

    it('keeps fixed dark module locked when preserveFunctionalPatterns=true', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 8;
      const qr = createMockQrWithFixedDark(moduleCount);
      const config = baseConfig({
        preserveFunctionalPatterns: true,
        preserveFinders: false,
        preserveTiming: false,
        preserveAlignment: false,
        protectFormatInfo: false,
        protectVersionInfo: false,
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      const darkCount = countDarkInModule(result.matrix, scale, moduleCount - 8, 8);
      expect(darkCount).toBe(scale * scale);
    });

    it('handles zero intensity (no overlay influence)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ ditherStrength: 0 });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('handles very high intensity (maximum overlay influence)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ ditherStrength: 100 });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 50, 50, 50));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        1.0,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('handles debug mode enabled', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ debugOverlayDither: true });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('exercises BW-first with effectiveIntensity=0 (textureAmount=0 branch)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ qrFirstMode: true });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0, // effectiveIntensity=0 → textureAmount=0
        config as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('exercises enforceModuleConstraints with all-dark QR (dark modules under-dark)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 3;
      const qr = createAllDarkQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();
      // Mostly white overlay → dark modules will have too few dark pixels → enforcement flips
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 250, 250, 250));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.9,
        config as never,
        createCanvas
      );

      // After enforcement, dark modules should have sufficient dark pixel ratio
      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('generates with different diffusion kernels', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      for (const kernel of ['floyd_steinberg', 'atkinson', 'stucki', 'sierra']) {
        const config = baseConfig({ diffusionKernel: kernel });
        const result = await gen(
          qr as never,
          config as never,
          overlay,
          moduleCount,
          scale,
          0.5,
          config as never,
          createCanvas
        );
        expect(result.matrix.length).toBe(moduleCount * scale);
      }
    });

    it('handles null ctx on detect canvas but non-null on scaled canvas', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();

      // First call (detect canvas) returns null ctx, second (scaled canvas) returns valid ctx
      let callCount = 0;
      const createCanvas = async (w: number, h: number) => {
        callCount++;
        if (callCount === 1) {
          // detect canvas - return null ctx
          return {
            width: w,
            height: h,
            getContext: vi.fn(() => null),
          } as unknown as HTMLCanvasElement;
        }
        // scaled canvas - return valid ctx
        const data = new Uint8ClampedArray(w * h * 4);
        fillUniform(data, 128, 128, 128);
        const ctx = {
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({ data, width: w, height: h })),
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high' as const,
        };
        return {
          width: w,
          height: h,
          getContext: vi.fn(() => ctx),
        } as unknown as HTMLCanvasElement;
      };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      // Should fall through BW detection (null ctx) and proceed with normal dithering
      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('handles null ctx on scaled canvas (returns empty matrix)', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();

      // Both detect and scaled return null ctx
      let callCount = 0;
      const createCanvas = async (w: number, h: number) => {
        callCount++;
        if (callCount === 1) {
          // detect canvas - null ctx (skip BW detection)
          return { width: w, height: h, getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement;
        }
        // scaled canvas - also null ctx → createEmptyMatrix
        return { width: w, height: h, getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement;
      };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      // Should return empty matrix
      expect(result.matrix.length).toBe(moduleCount * scale);
      for (const row of result.matrix) {
        for (const val of row) {
          expect(val).toBe(false);
        }
      }
    });

    it('exercises colorMode bw in standard dithering path', async () => {
      const gen = await getDithered();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ colorMode: 'bw' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        config as never,
        createCanvas
      );

      // In bw mode, all colors should be null
      for (const row of result.colors) {
        for (const c of row) {
          expect(c).toBeNull();
        }
      }
    });
  });

  // ================================================================
  // generateBlueNoiseMatrix
  // ================================================================
  describe('generateBlueNoiseMatrix', () => {
    async function getBlueNoise() {
      const mod = await import('../../src/modules/qr-generator/pixel-matrix-dithered');
      return mod.generateBlueNoiseMatrix;
    }

    it('generates blue noise matrix with standard overlay', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));
      const canvasFactory = { createCanvas: mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128)) };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
      expect(result.colors.length).toBe(moduleCount * scale);
    });

    it('uses QR-first mode when config.qrFirstMode is true', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ qrFirstMode: true });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));
      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('auto-detects BW overlay and uses QR-first mode', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillBW(d));
      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('handles null ctx on detect canvas (skips BW detection)', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();

      let callCount = 0;
      const createCanvas = async (w: number, h: number) => {
        callCount++;
        if (callCount === 1) {
          return { width: w, height: h, getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement;
        }
        const data = new Uint8ClampedArray(w * h * 4);
        fillUniform(data, 128, 128, 128);
        const ctx = {
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({ data, width: w, height: h })),
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high' as const,
        };
        return { width: w, height: h, getContext: vi.fn(() => ctx) } as unknown as HTMLCanvasElement;
      };

      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('handles null ctx on scaled canvas (returns empty matrix)', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFnNullCtx();
      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
      for (const row of result.matrix) {
        for (const val of row) {
          expect(val).toBe(false);
        }
      }
    });

    it('exercises colorMode bw in blue noise path (colors are null)', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ colorMode: 'bw' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));
      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      for (const row of result.colors) {
        for (const c of row) {
          expect(c).toBeNull();
        }
      }
    });

    it('exercises locked module preservation in blue noise', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({
        preserveFinders: true,
        preserveTiming: true,
        protectFormatInfo: true,
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));
      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });

    it('exercises different blue noise seed and tile size', async () => {
      const gen = await getBlueNoise();
      const moduleCount = 21;
      const scale = 2;
      const qr = createMockQr(moduleCount);
      const config = baseConfig({ blueNoiseSeed: 9999, blueNoiseTileSize: 32 });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));
      const canvasFactory = { createCanvas };

      const result = await gen(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        0.5,
        canvasFactory as never,
        createCanvas
      );

      expect(result.matrix.length).toBe(moduleCount * scale);
    });
  });
});
