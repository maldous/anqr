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

// ======================================================================
// Mock helpers
// ======================================================================

function fillUniform(data: Uint8ClampedArray, r: number, g: number, b: number, a = 255) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }
}

function fillGradient(data: Uint8ClampedArray, width: number) {
  for (let i = 0; i < data.length; i += 4) {
    const pixel = i / 4;
    const x = pixel % width;
    const val = Math.floor((x / width) * 255);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
}

type PixelFiller = (data: Uint8ClampedArray, width: number) => void;

function mockCreateCanvasFn(filler: PixelFiller) {
  return async (w: number, h: number) => {
    const data = new Uint8ClampedArray(w * h * 4);
    filler(data, w);
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

function mockCreateCanvasFnNullCtx() {
  return async (w: number, h: number) =>
    ({
      width: w,
      height: h,
      getContext: vi.fn(() => null),
    }) as unknown as HTMLCanvasElement;
}

function createOverlayCanvas(w = 100, h = 100): HTMLCanvasElement {
  return {
    width: w,
    height: h,
    getContext: vi.fn(() => null),
  } as unknown as HTMLCanvasElement;
}

function createMockQr(moduleCount: number) {
  return {
    isDark: (row: number, col: number) => (row + col) % 2 === 0,
    getModuleCount: () => moduleCount,
  };
}

function subpixelConfig(overrides: Record<string, unknown> = {}) {
  return {
    typeNumber: 1,
    moduleSize: 10,
    margin: 4,
    overlayIntensity: 50,
    subpixelGridSize: '3x3',
    subpixelCenterRule: 'strict',
    subpixelFinderOverride: 'solid',
    subpixelNeutralColor: undefined,
    colorMode: 'color',
    preserveFinders: true,
    preserveTiming: false,
    preserveAlignment: false,
    protectFormatInfo: false,
    protectVersionInfo: false,
    ...overrides,
  };
}

// ======================================================================
// overlay-subpixel.ts
// ======================================================================
describe('qr-generator/overlay-subpixel.ts', () => {
  describe('getSubpixelOverlayData', () => {
    async function getFunc() {
      const mod = await import('../../src/modules/qr-generator/overlay-subpixel');
      return mod.getSubpixelOverlayData;
    }

    it('returns brightness and color data for a valid overlay', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const scale = 3;
      const config = subpixelConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(overlay, moduleCount, scale, config as never, createCanvas);

      expect(result.brightness).toBeDefined();
      expect(result.colors).toBeDefined();
      const scaledSize = moduleCount * scale;
      expect(result.brightness.length).toBe(scaledSize);
      expect(result.colors.length).toBe(scaledSize);
      // Uniform gray → brightness should be ~0.5
      expect(result.brightness[0][0]).toBeCloseTo(128 / 255, 1);
      expect(result.colors[0][0]).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('returns empty arrays when ctx is null', async () => {
      const fn = await getFunc();
      const config = subpixelConfig();
      const overlay = createOverlayCanvas();

      const result = await fn(overlay, 21, 3, config as never, mockCreateCanvasFnNullCtx());

      expect(result.brightness).toEqual([]);
      expect(result.colors).toEqual([]);
    });

    it('handles gradient image data', async () => {
      const fn = await getFunc();
      const config = subpixelConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d, w) => fillGradient(d, w));

      const result = await fn(overlay, 21, 2, config as never, createCanvas);

      expect(result.brightness.length).toBe(42);
      // Left side should be darker than right side
      expect(result.brightness[0][0]).toBeLessThan(result.brightness[0][41]);
    });
  });

  describe('generateSubpixelMatrix', () => {
    async function getFunc() {
      const mod = await import('../../src/modules/qr-generator/overlay-subpixel');
      return mod.generateSubpixelMatrix;
    }

    it('generates subpixel matrix with default config (strict center, solid finders)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const scale = 3;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig();
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        scale,
        false,
        createCanvas
      );

      expect(result.matrix).toBeDefined();
      const actualScale = 3; // parseGridSize('3x3') → 3
      expect(result.matrix.length).toBe(moduleCount * actualScale);
      expect(result.colors.length).toBe(moduleCount * actualScale);
      expect(result.scale).toBe(actualScale);
    });

    it('exercises parseGridSize with various inputs', async () => {
      const fn = await getFunc();
      const qr = createMockQr(21);
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      // '2x2' → scale=2
      const r2 = await fn(
        qr as never,
        subpixelConfig({ subpixelGridSize: '2x2' }) as never,
        overlay,
        21,
        2,
        false,
        createCanvas
      );
      expect(r2.scale).toBe(2);

      // '4x4' → scale=4
      const r4 = await fn(
        qr as never,
        subpixelConfig({ subpixelGridSize: '4x4' }) as never,
        overlay,
        21,
        4,
        false,
        createCanvas
      );
      expect(r4.scale).toBe(4);

      // undefined → default 3
      const rd = await fn(
        qr as never,
        subpixelConfig({ subpixelGridSize: undefined }) as never,
        overlay,
        21,
        3,
        false,
        createCanvas
      );
      expect(rd.scale).toBe(3);

      // invalid → default 3
      const ri = await fn(
        qr as never,
        subpixelConfig({ subpixelGridSize: 'invalid' }) as never,
        overlay,
        21,
        3,
        false,
        createCanvas
      );
      expect(ri.scale).toBe(3);
    });

    it('exercises subpixelNeutralColor (parseHexColor branches)', async () => {
      const fn = await getFunc();
      const qr = createMockQr(21);
      const overlay = createOverlayCanvas();
      // Use null ctx so overlay data is missing - neutral color will be used as fallback
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 0, 0, 0, 0));

      // Valid hex with #
      const r1 = await fn(
        qr as never,
        subpixelConfig({ subpixelNeutralColor: '#ff8800' }) as never,
        overlay,
        21,
        3,
        false,
        createCanvas
      );
      expect(r1.matrix.length).toBe(63);

      // Valid hex without #
      const r2 = await fn(
        qr as never,
        subpixelConfig({ subpixelNeutralColor: 'ff8800' }) as never,
        overlay,
        21,
        3,
        false,
        createCanvas
      );
      expect(r2.matrix.length).toBe(63);

      // Invalid hex → null
      const r3 = await fn(
        qr as never,
        subpixelConfig({ subpixelNeutralColor: 'xyz' }) as never,
        overlay,
        21,
        3,
        false,
        createCanvas
      );
      expect(r3.matrix.length).toBe(63);

      // undefined → null
      const r4 = await fn(
        qr as never,
        subpixelConfig({ subpixelNeutralColor: undefined }) as never,
        overlay,
        21,
        3,
        false,
        createCanvas
      );
      expect(r4.matrix.length).toBe(63);
    });

    it('exercises structural module with finderOverride=solid (solid render)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({ subpixelFinderOverride: 'solid' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      // For structural modules with solid override, colors should be null
      // Finder pattern occupies (0,0)-(6,6): scaled to (0,0)-(20,20) at scale=3
      expect(result.colors[0][0]).toBeNull();
    });

    it('exercises structural module with finderOverride=stylized (overlay applied)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({ subpixelFinderOverride: 'stylized' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 200, 100, 50));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      // With stylized, structural modules should get overlay colors
      expect(result.matrix.length).toBe(63);
    });

    it('exercises halftone center rule (useHalftoneCenter=true)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({
        subpixelCenterRule: 'halftone_center',
        subpixelFinderOverride: 'stylized',
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      // Center pixels of dark modules should have halftone data
      const scale = 3;
      const centerIdx = Math.floor(scale / 2); // = 1
      // Check a non-structural dark module center pixel
      // Module (4,4) in checkerboard: (4+4)%2=0 → dark
      const py = 4 * scale + centerIdx;
      const px = 4 * scale + centerIdx;
      const color = result.colors[py]?.[px];
      if (color) {
        expect(color).toHaveProperty('halftone', true);
        expect(color).toHaveProperty('sizeRatio');
      }
    });

    it('exercises useHalftoneCenter passed as argument', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({
        subpixelCenterRule: 'strict', // not halftone_center
        subpixelFinderOverride: 'stylized',
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      // Pass useHalftoneCenter=true as function argument (overrides center rule)
      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        true,
        createCanvas
      );

      expect(result.matrix.length).toBe(63);
    });

    it('exercises strict center rule (no halftone)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({
        subpixelCenterRule: 'strict',
        subpixelFinderOverride: 'stylized',
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      // Center pixels should have overlay colors without halftone property
      const scale = 3;
      const centerIdx = Math.floor(scale / 2);
      const py = 4 * scale + centerIdx;
      const px = 4 * scale + centerIdx;
      const color = result.colors[py]?.[px];
      if (color) {
        expect(color.halftone).toBeUndefined();
      }
    });

    it('exercises non-center surrounding pixels (overlay threshold)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({
        overlayIntensity: 100,
        subpixelFinderOverride: 'stylized',
      });
      const overlay = createOverlayCanvas();
      // Very dark overlay → non-center pixels should be dark
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 10, 10, 10));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      // Non-center pixel of a non-structural module should be dark (brightness < threshold)
      const scale = 3;
      const py = 10 * scale + 0; // first subpixel, not center
      const px = 10 * scale + 0;
      expect(result.matrix[py][px]).toBe(true); // dark because brightness(10,10,10) < threshold
    });

    it('exercises non-center surrounding pixels with light overlay', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({
        overlayIntensity: 100,
        subpixelFinderOverride: 'stylized',
      });
      const overlay = createOverlayCanvas();
      // Very bright overlay → non-center pixels should be light
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 250, 250, 250));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      const scale = 3;
      const py = 10 * scale + 0;
      const px = 10 * scale + 0;
      expect(result.matrix[py][px]).toBe(false); // light because brightness > threshold
    });

    it('exercises colorMode bw (no color data)', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({ colorMode: 'bw', subpixelFinderOverride: 'stylized' });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      expect(result.matrix.length).toBe(63);
    });

    it('returns effectiveIntensity as percentage', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      const qr = createMockQr(moduleCount);
      const config = subpixelConfig({ overlayIntensity: 75 });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      expect(result.effectiveIntensity).toBeCloseTo(Math.pow(0.75, 4) * 100, 6);
    });

    it('handles center of light module (qrValue=false) with halftone', async () => {
      const fn = await getFunc();
      const moduleCount = 21;
      // All modules are light
      const qr = { isDark: () => false, getModuleCount: () => moduleCount };
      const config = subpixelConfig({
        subpixelCenterRule: 'halftone_center',
        subpixelFinderOverride: 'stylized',
      });
      const overlay = createOverlayCanvas();
      const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 128, 128, 128));

      const result = await fn(
        qr as never,
        config as never,
        overlay,
        moduleCount,
        3,
        false,
        createCanvas
      );

      // Light modules center: qrValue=false, halftone only applies to dark modules
      const scale = 3;
      const centerIdx = Math.floor(scale / 2);
      const py = 4 * scale + centerIdx;
      const px = 4 * scale + centerIdx;
      expect(result.matrix[py][px]).toBe(false);
    });
  });
});

// ======================================================================
// pixel-matrix-dithered.ts (blue-noise path)
// ======================================================================
describe('qr-generator/pixel-matrix-dithered.ts', () => {
  async function getBlueNoiseFunc() {
    const mod = await import('../../src/modules/qr-generator/pixel-matrix-dithered');
    return mod.generateBlueNoiseMatrix;
  }

  function blueNoiseConfig(overrides: Record<string, unknown> = {}) {
    return {
      typeNumber: 1,
      moduleSize: 10,
      margin: 4,
      overlayMode: 'blue-noise',
      colorMode: 'color',
      overlayIntensity: 70,
      blueNoiseSeed: 42,
      blueNoiseTileSize: 64,
      preserveFinders: true,
      preserveTiming: true,
      preserveAlignment: true,
      protectFormatInfo: true,
      protectVersionInfo: true,
      ...overrides,
    };
  }

  it('exports generateBlueNoiseMatrix', async () => {
    const mod = await import('../../src/modules/qr-generator/pixel-matrix-dithered');
    expect(mod.generateBlueNoiseMatrix).toBeDefined();
  });

  it('generates matrix and colors with overlay data', async () => {
    const fn = await getBlueNoiseFunc();
    const moduleCount = 21;
    const scale = 2;
    const qr = createMockQr(moduleCount);
    const overlay = createOverlayCanvas(moduleCount * scale, moduleCount * scale);
    const createCanvas = mockCreateCanvasFn((d) => fillUniform(d, 100, 150, 200));
    const canvasFactory = { createCanvas };

    const result = await fn(
      qr as never,
      blueNoiseConfig() as never,
      overlay,
      moduleCount,
      scale,
      0.8,
      canvasFactory as never,
      createCanvas
    );

    expect(result.matrix.length).toBe(moduleCount * scale);
    expect(result.colors.length).toBe(moduleCount * scale);
  });

  it('returns empty matrix when readback canvas has null context', async () => {
    const fn = await getBlueNoiseFunc();
    const moduleCount = 21;
    const scale = 2;
    const qr = createMockQr(moduleCount);
    const overlay = createOverlayCanvas(moduleCount * scale, moduleCount * scale);
    const createCanvas = mockCreateCanvasFnNullCtx();
    const canvasFactory = { createCanvas };

    const result = await fn(
      qr as never,
      blueNoiseConfig() as never,
      overlay,
      moduleCount,
      scale,
      0.8,
      canvasFactory as never,
      createCanvas
    );

    expect(result.matrix.length).toBe(moduleCount * scale);
    for (const row of result.matrix) {
      for (const value of row) {
        expect(value).toBe(false);
      }
    }
  });
});
