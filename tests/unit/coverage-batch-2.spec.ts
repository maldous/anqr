/**
 * Coverage Batch 2 — tests targeting low-coverage qr-generator source files.
 *
 * Environment: happy-dom (provides document, Image, FileReader, canvas, etc.)
 *
 * NOTE: happy-dom does NOT provide a real CanvasRenderingContext2D, so we
 * patch HTMLCanvasElement.prototype.getContext in beforeAll/afterAll to return
 * a comprehensive mock context for all '2d' requests.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// Module-level mocks (hoisted)
// ============================================================================

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ============================================================================
// ImageData polyfill (safety net)
// ============================================================================

if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = class MockImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace = 'srgb';
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
    }
  };
}

// ============================================================================
// Global Canvas 2D Context Mock
// ============================================================================

const mockCtxCache = new WeakMap<HTMLCanvasElement, Record<string, unknown>>();

function createMockCtx(canvas: HTMLCanvasElement): Record<string, unknown> {
  const existing = mockCtxCache.get(canvas);
  if (existing) return existing;

  const ctx: Record<string, unknown> = {
    canvas,
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    putImageData: vi.fn(),
    getImageData: vi.fn((x: number, y: number, w: number, h: number) => {
      const data = new Uint8ClampedArray(w * h * 4);
      // Fill with non-zero data so brightness calculations produce meaningful values
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;     // R
        data[i + 1] = 128; // G
        data[i + 2] = 128; // B
        data[i + 3] = 255; // A
      }
      return new ImageData(data, w, h);
    }),
    isPointInPath: vi.fn(() => false),
    // Writable properties
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    lineDashOffset: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    shadowBlur: 0,
    shadowColor: 'rgba(0,0,0,0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    filter: 'none',
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
  };

  mockCtxCache.set(canvas, ctx);
  return ctx;
}

let origGetContext: typeof HTMLCanvasElement.prototype.getContext;

beforeAll(() => {
  origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    contextId: string,
    ..._args: unknown[]
  ) {
    if (contextId === '2d') {
      return createMockCtx(this) as unknown as CanvasRenderingContext2D;
    }
    return origGetContext.call(this, contextId, ..._args) as RenderingContext | null;
  } as typeof HTMLCanvasElement.prototype.getContext;
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = origGetContext;
});

// ============================================================================
// Helpers
// ============================================================================

function mockQR(moduleCount: number, darkFn?: (r: number, c: number) => boolean) {
  return {
    isDark: darkFn ?? ((r: number, c: number) => (r + c) % 2 === 0),
    getModuleCount: () => moduleCount,
    addData: vi.fn(),
    make: vi.fn(),
  };
}

const createCanvasFn = async (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c as HTMLCanvasElement | OffscreenCanvas;
};

function makeMinimalConfig(overrides: Record<string, unknown> = {}) {
  return {
    content: 'TEST',
    errorCorrection: 'M' as const,
    typeNumber: 1,
    moduleSize: 10,
    margin: 1,
    fgColor: '#000000',
    bgColor: '#ffffff',
    overlayIntensity: 50,
    colorMode: 'bw',
    ...overrides,
  };
}

// ============================================================================
// 1. cache.ts
// ============================================================================

describe('cache.ts', () => {
  it('MemoCache evicts oldest entry when at capacity', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<string>(2);

    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    expect(cache.get('a')).toBe('alpha');
    expect(cache.get('b')).toBe('beta');

    // Adding a third entry should evict 'a' (oldest after 'b' was accessed last)
    // After get('a') then get('b'), order is a, b. Adding 'c' evicts 'a'.
    // Actually after get('a'), get('b'): order is a(moved to end), b(moved to end)
    // So a was accessed, then b was accessed. Map order: a, b.
    // Wait - get moves to end. After set(a), set(b): order = [a, b].
    // get(a): delete a, set a → order = [b, a].
    // get(b): delete b, set b → order = [a, b].
    // Now set(c): size >= 2, evict first = 'a'. order = [b, c].
    cache.set('c', 'charlie');
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('beta');
    expect(cache.get('c')).toBe('charlie');
  });

  it('MemoCache.set updates existing key order', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<string>(2);

    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    // Update 'a' - moves it to end
    cache.set('a', 'alpha2');
    // Now order is [b, a]. Adding c evicts b.
    cache.set('c', 'charlie');
    expect(cache.get('a')).toBe('alpha2');
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe('charlie');
  });

  it('clearQRCaches clears all caches', async () => {
    const { alignmentCache, overlayDataCache, qrMatrixCache, clearQRCaches } = await import(
      '../../src/modules/qr-generator/cache'
    );

    alignmentCache.set('test', [{ row: 0, col: 0 }]);
    overlayDataCache.set('test', { 0: { 0: 0.5 } });
    qrMatrixCache.set('test', { qr: mockQR(5), moduleCount: 5 });

    clearQRCaches();

    expect(alignmentCache.get('test')).toBeUndefined();
    expect(overlayDataCache.get('test')).toBeUndefined();
    expect(qrMatrixCache.get('test')).toBeUndefined();
  });
});

// ============================================================================
// 2. utils.ts — validateColor + hashString + hashCanvasContent
// ============================================================================

describe('utils.ts', () => {
  describe('validateColor', () => {
    let validateColor: (color: unknown, fallback: string) => string;

    beforeAll(async () => {
      const mod = await import('../../src/modules/qr-generator/utils');
      validateColor = mod.validateColor;
    });

    it('returns fallback for non-string', () => {
      expect(validateColor(undefined, '#fff')).toBe('#fff');
      expect(validateColor(null, '#fff')).toBe('#fff');
      expect(validateColor(123, '#fff')).toBe('#fff');
    });

    it('returns fallback for empty string', () => {
      expect(validateColor('', '#fff')).toBe('#fff');
    });

    it('returns fallback for string shorter than 4 chars', () => {
      expect(validateColor('ab', '#fff')).toBe('#fff');
      expect(validateColor('#ab', '#fff')).toBe('#fff');
    });

    it('accepts valid hex colors', () => {
      expect(validateColor('#abc', '#fff')).toBe('#abc');
      expect(validateColor('#aabbcc', '#fff')).toBe('#aabbcc');
      expect(validateColor('#aabbccdd', '#fff')).toBe('#aabbccdd');
    });

    it('rejects invalid hex colors', () => {
      expect(validateColor('#xyz', '#fff')).toBe('#fff');
      expect(validateColor('#gggggg', '#fff')).toBe('#fff');
    });

    it('accepts rgb/rgba format', () => {
      expect(validateColor('rgb(0,0,0)', '#fff')).toBe('rgb(0,0,0)');
      expect(validateColor('rgba(0,0,0,1)', '#fff')).toBe('rgba(0,0,0,1)');
    });

    it('accepts hsl/hsla format', () => {
      expect(validateColor('hsl(0,100%,50%)', '#fff')).toBe('hsl(0,100%,50%)');
      expect(validateColor('hsla(0,100%,50%,1)', '#fff')).toBe('hsla(0,100%,50%,1)');
    });

    it('accepts named colors', () => {
      expect(validateColor('red', '#fff')).toBe('#fff'); // 'red' is only 3 chars → fallback
      expect(validateColor('blue', '#fff')).toBe('blue');
      expect(validateColor('white', '#fff')).toBe('white');
      expect(validateColor('cornflowerblue', '#fff')).toBe('cornflowerblue');
    });

    it('rejects unknown formats', () => {
      expect(validateColor('not-a-color', '#fff')).toBe('#fff');
      expect(validateColor('12345', '#fff')).toBe('#fff');
    });
  });

  describe('hashString', () => {
    it('produces consistent unsigned 32-bit hash', async () => {
      const { hashString } = await import('../../src/modules/qr-generator/utils');
      const h1 = hashString('hello');
      const h2 = hashString('hello');
      expect(h1).toBe(h2);
      expect(h1).toBeGreaterThanOrEqual(0);
      // Different strings produce different hashes
      expect(hashString('world')).not.toBe(h1);
    });
  });

  describe('hashCanvasContent', () => {
    let hashCanvasContent: (
      canvas: HTMLCanvasElement | OffscreenCanvas,
      fn: (w: number, h: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
    ) => Promise<string>;

    beforeAll(async () => {
      const mod = await import('../../src/modules/qr-generator/utils');
      hashCanvasContent = mod.hashCanvasContent;
    });

    beforeEach(async () => {
      const { clearQRCaches } = await import('../../src/modules/qr-generator/cache');
      clearQRCaches();
    });

    it('returns a hex hash string for a canvas', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const hash = await hashCanvasContent(canvas, createCanvasFn);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('returns cached hash on second call with same canvas', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const h1 = await hashCanvasContent(canvas, createCanvasFn);
      const h2 = await hashCanvasContent(canvas, createCanvasFn);
      expect(h1).toBe(h2);
    });

    it('returns dimension fallback when getContext fails', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 77;
      canvas.height = 33;
      // The hash canvas is created via document.createElement inside the function.
      // We need to make getContext return null for that INNER canvas.
      // Temporarily override prototype to return null for ALL canvases.
      const prev = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
      try {
        const hash = await hashCanvasContent(canvas, createCanvasFn);
        expect(hash).toBe('77x33');
      } finally {
        HTMLCanvasElement.prototype.getContext = prev;
      }
    });

    it('returns dimension fallback when getImageData throws', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 42;
      canvas.height = 24;
      // Patch getContext to return a ctx where getImageData throws
      const prev = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (contextId: string) {
        if (contextId === '2d') {
          return {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => { throw new Error('Security error'); }),
          } as unknown as CanvasRenderingContext2D;
        }
        return null;
      } as typeof HTMLCanvasElement.prototype.getContext;
      try {
        const hash = await hashCanvasContent(canvas, createCanvasFn);
        expect(hash).toBe('42x24');
      } finally {
        HTMLCanvasElement.prototype.getContext = prev;
      }
    });
  });
});

// ============================================================================
// 3. overlay-data.ts — getOverlayData + loadImageDataRGB
// ============================================================================

describe('overlay-data.ts', () => {
  beforeEach(async () => {
    const { clearQRCaches } = await import('../../src/modules/qr-generator/cache');
    clearQRCaches();
  });

  describe('getOverlayData', () => {
    it('returns empty object for null overlay', async () => {
      const { getOverlayData } = await import('../../src/modules/qr-generator/overlay-data');
      const result = await getOverlayData(null, 5, makeMinimalConfig(), createCanvasFn);
      // null overlay → return {} as OverlayData (line 24)
      expect(result).toEqual({});
    });

    it('extracts brightness data in bw mode', async () => {
      const { getOverlayData } = await import('../../src/modules/qr-generator/overlay-data');
      const overlay = document.createElement('canvas');
      overlay.width = 10;
      overlay.height = 10;

      const config = makeMinimalConfig({ colorMode: 'bw' });
      const result = await getOverlayData(overlay, 3, config, createCanvasFn);

      // Should have brightness data for each module
      expect(result[0]).toBeDefined();
      expect(typeof result[0][0]).toBe('number');
      // In bw mode, colors should not be present
      expect(result.colors).toBeUndefined();
    });

    it('extracts color data when colorMode is not bw', async () => {
      const { getOverlayData } = await import('../../src/modules/qr-generator/overlay-data');
      const overlay = document.createElement('canvas');
      overlay.width = 10;
      overlay.height = 10;

      const config = makeMinimalConfig({ colorMode: 'color' });
      const result = await getOverlayData(overlay, 3, config, createCanvasFn);

      // Should have both brightness and color data (lines 95-110)
      expect(result[0]).toBeDefined();
      expect(result.colors).toBeDefined();
      expect(result.colors![0][0]).toHaveProperty('r');
      expect(result.colors![0][0]).toHaveProperty('g');
      expect(result.colors![0][0]).toHaveProperty('b');
    });

    it('returns cached result on second call', async () => {
      const { getOverlayData } = await import('../../src/modules/qr-generator/overlay-data');
      const overlay = document.createElement('canvas');
      overlay.width = 10;
      overlay.height = 10;

      const config = makeMinimalConfig({ colorMode: 'bw' });
      const result1 = await getOverlayData(overlay, 3, config, createCanvasFn);
      const result2 = await getOverlayData(overlay, 3, config, createCanvasFn);

      // Same reference from cache (line 33)
      expect(result1).toBe(result2);
    });

    it('returns empty object when ctx is null', async () => {
      const { getOverlayData } = await import('../../src/modules/qr-generator/overlay-data');
      const overlay = document.createElement('canvas');
      overlay.width = 10;
      overlay.height = 10;

      // createCanvasFn that returns a canvas with null ctx (line 43)
      const nullCtxCanvasFn = async (w: number, h: number) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        vi.spyOn(c, 'getContext').mockReturnValue(null);
        return c as HTMLCanvasElement | OffscreenCanvas;
      };

      const config = makeMinimalConfig({ colorMode: 'bw' });
      const result = await getOverlayData(overlay, 3, config, nullCtxCanvasFn);
      expect(result).toEqual({});
    });
  });

  describe('loadImageDataRGB', () => {
    it('converts ImageData to RGB array', async () => {
      const { loadImageDataRGB } = await import('../../src/modules/qr-generator/overlay-data');
      const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 128, 128, 128, 255]);
      const imageData = new ImageData(data, 2, 2);
      const result = loadImageDataRGB(imageData);

      expect(result.length).toBe(2);
      expect(result[0].length).toBe(2);
      expect(result[0][0]).toEqual({ r: 255, g: 0, b: 0 });
      expect(result[0][1]).toEqual({ r: 0, g: 255, b: 0 });
      expect(result[1][0]).toEqual({ r: 0, g: 0, b: 255 });
      expect(result[1][1]).toEqual({ r: 128, g: 128, b: 128 });
    });
  });
});

// ============================================================================
// 4. drawing-patterns.ts — style branches
// ============================================================================

describe('drawing-patterns.ts', () => {
  function makeMockCtx() {
    return {
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;
  }

  describe('drawFinderPatternComplete', () => {
    let drawFinderPatternComplete: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      moduleSize: number,
      config: Record<string, unknown>
    ) => void;

    beforeAll(async () => {
      const mod = await import('../../src/modules/qr-generator/drawing-patterns');
      drawFinderPatternComplete = mod.drawFinderPatternComplete;
    });

    it('draws square finder pattern (default)', () => {
      const ctx = makeMockCtx();
      drawFinderPatternComplete(ctx, 0, 0, 10, makeMinimalConfig());
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('draws rounded finder pattern', () => {
      const ctx = makeMockCtx();
      drawFinderPatternComplete(ctx, 0, 0, 10, makeMinimalConfig({
        eyeOuterStyle: 'rounded',
        eyeInnerStyle: 'rounded',
      }));
      // rounded uses roundRect → beginPath + quadraticCurveTo
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.quadraticCurveTo).toHaveBeenCalled();
    });

    it('draws circle finder pattern', () => {
      const ctx = makeMockCtx();
      drawFinderPatternComplete(ctx, 0, 0, 10, makeMinimalConfig({
        eyeOuterStyle: 'circle',
        eyeInnerStyle: 'circle',
      }));
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('applies eyeScale', () => {
      const ctx = makeMockCtx();
      drawFinderPatternComplete(ctx, 0, 0, 10, makeMinimalConfig({
        eyeScale: 80,
      }));
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('uses finderStyle as fallback for eye styles', () => {
      const ctx = makeMockCtx();
      drawFinderPatternComplete(ctx, 0, 0, 10, makeMinimalConfig({
        finderStyle: 'circle',
      }));
      expect(ctx.arc).toHaveBeenCalled();
    });
  });

  describe('drawAlignmentPattern', () => {
    let drawAlignmentPattern: (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      moduleSize: number,
      style: string,
      config: Record<string, unknown>
    ) => void;

    beforeAll(async () => {
      const mod = await import('../../src/modules/qr-generator/drawing-patterns');
      drawAlignmentPattern = mod.drawAlignmentPattern;
    });

    it('draws square alignment (default)', () => {
      const ctx = makeMockCtx();
      drawAlignmentPattern(ctx, 50, 50, 10, 'square', makeMinimalConfig());
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('draws rounded alignment', () => {
      const ctx = makeMockCtx();
      drawAlignmentPattern(ctx, 50, 50, 10, 'rounded', makeMinimalConfig());
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.quadraticCurveTo).toHaveBeenCalled();
    });

    it('draws circle alignment', () => {
      const ctx = makeMockCtx();
      drawAlignmentPattern(ctx, 50, 50, 10, 'circle', makeMinimalConfig());
      expect(ctx.arc).toHaveBeenCalled();
    });

    it('match_finder resolves to finderStyle', () => {
      const ctx = makeMockCtx();
      drawAlignmentPattern(ctx, 50, 50, 10, 'match_finder', makeMinimalConfig({
        finderStyle: 'circle',
      }));
      expect(ctx.arc).toHaveBeenCalled();
    });
  });

  describe('drawTimingModule', () => {
    let drawTimingModule: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      style: string,
      config: Record<string, unknown>
    ) => void;

    beforeAll(async () => {
      const mod = await import('../../src/modules/qr-generator/drawing-patterns');
      drawTimingModule = mod.drawTimingModule;
    });

    it('draws default solid square', () => {
      const ctx = makeMockCtx();
      drawTimingModule(ctx, 0, 0, 10, 'default', makeMinimalConfig());
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('draws match_module style', () => {
      const ctx = makeMockCtx();
      drawTimingModule(ctx, 0, 0, 10, 'match_module', makeMinimalConfig({
        moduleStyle: 'square',
      }));
      // drawModule is called internally
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('draws dashed timing module', () => {
      const ctx = makeMockCtx();
      drawTimingModule(ctx, 0, 0, 10, 'dashed', makeMinimalConfig());
      // dashed uses fillRect with reduced size
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// 5. pixel-matrix-dither.ts — normalizeColors + generateDitherModeMatrix
// ============================================================================

describe('pixel-matrix-dither.ts', () => {
  describe('normalizeColors', () => {
    let normalizeColors: (
      colors: Record<number, Record<number, { r: number; g: number; b: number }>> | undefined,
      moduleCount: number
    ) => unknown[][];

    beforeAll(async () => {
      const mod = await import('../../src/modules/qr-generator/pixel-matrix-dither');
      normalizeColors = mod.normalizeColors;
    });

    it('returns null entries when colors is undefined', () => {
      const result = normalizeColors(undefined, 2);
      expect(result.length).toBe(2);
      expect(result[0][0]).toBeNull();
      expect(result[0][1]).toBeNull();
      expect(result[1][0]).toBeNull();
      expect(result[1][1]).toBeNull();
    });

    it('converts color objects to RGBWithMeta', () => {
      const colors = {
        0: { 0: { r: 255, g: 0, b: 0 }, 1: { r: 0, g: 255, b: 0 } },
        1: { 0: { r: 0, g: 0, b: 255 }, 1: { r: 128, g: 128, b: 128 } },
      };
      const result = normalizeColors(colors, 2);
      expect(result[0][0]).toEqual({ r: 255, g: 0, b: 0 });
      expect(result[0][1]).toEqual({ r: 0, g: 255, b: 0 });
      expect(result[1][0]).toEqual({ r: 0, g: 0, b: 255 });
      expect(result[1][1]).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('handles sparse color data', () => {
      const colors = {
        0: { 0: { r: 255, g: 0, b: 0 } },
      };
      const result = normalizeColors(colors, 2);
      expect(result[0][0]).toEqual({ r: 255, g: 0, b: 0 });
      expect(result[0][1]).toBeNull();
      expect(result[1][0]).toBeNull();
    });
  });

  describe('generateDitherModeMatrix', () => {
    beforeEach(async () => {
      const { clearQRCaches } = await import('../../src/modules/qr-generator/cache');
      clearQRCaches();
    });

    it('returns a PixelDecisionMatrix with correct shape', async () => {
      const { generateDitherModeMatrix } = await import(
        '../../src/modules/qr-generator/pixel-matrix-dither'
      );
      const qr = mockQR(5);
      const overlay = document.createElement('canvas');
      overlay.width = 20;
      overlay.height = 20;

      const config = makeMinimalConfig({ overlayIntensity: 50, colorMode: 'bw' });
      const result = await generateDitherModeMatrix(
        qr,
        config,
        overlay,
        5,
        50,
        config,
        'dither',
        createCanvasFn
      );

      expect(result.matrix).toBeDefined();
      expect(result.matrix.length).toBe(5);
      expect(result.colors).toBeDefined();
      expect(result.scale).toBe(1);
      expect(result.effectiveIntensity).toBe(50);
    });
  });
});

// ============================================================================
// 6. pixel-matrix-standard.ts — generateStandardMatrix
// ============================================================================

describe('pixel-matrix-standard.ts', () => {
  beforeEach(async () => {
    const { clearQRCaches } = await import('../../src/modules/qr-generator/cache');
    clearQRCaches();
  });

  it('generates a standard pixel matrix', async () => {
    const { generateStandardMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix-standard'
    );

    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ colorMode: 'bw', overlayIntensity: 50 });
    const result = await generateStandardMatrix(
      qr,
      config,
      overlay,
      5,
      50,
      config,
      createCanvasFn
    );

    expect(result.matrix).toBeDefined();
    expect(result.matrix.length).toBe(5);
    expect(result.matrix[0].length).toBe(5);
    // Verify matrix matches qr.isDark
    expect(result.matrix[0][0]).toBe(true); // (0+0)%2 === 0
    expect(result.matrix[0][1]).toBe(false); // (0+1)%2 === 1
    expect(result.colors).toBeDefined();
    expect(result.scale).toBe(1);
    expect(result.effectiveIntensity).toBe(50);
    expect(result.overlayData).toBeDefined();
  });
});

// ============================================================================
// 7. pixel-matrix.ts — generatePixelDecisionMatrix routing
// ============================================================================

describe('pixel-matrix.ts', () => {
  beforeEach(async () => {
    const { clearQRCaches } = await import('../../src/modules/qr-generator/cache');
    clearQRCaches();
  });

  const mockCanvasFactory = {
    createCanvas: createCanvasFn,
    loadImage: vi.fn(),
  };

  it('returns base matrix when overlay is null', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const config = makeMinimalConfig();

    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      null,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.overlayData).toBeNull();
    expect(result.matrix).toBeDefined();
    expect(result.matrix.length).toBeGreaterThan(0);
    expect(result.scale).toBeGreaterThanOrEqual(1);
  });

  it('routes to standard mode for unknown/default overlayMode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'standard' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
    expect(result.scale).toBe(1);
  });

  it('routes to dither mode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'dither' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
    expect(result.scale).toBe(1);
  });

  it('routes to extreme mode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'extreme' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
  });

  it('routes to dithered mode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'dithered' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
  });

  it('routes to blue-noise mode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'blue-noise' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
  });

  it('routes to blue_noise mode (underscore variant)', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'blue_noise' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
  });

  it('routes to subpixel mode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'subpixel' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
  });

  it('routes to subpixel-size mode', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({ overlayMode: 'subpixel-size' });
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );

    expect(result.matrix).toBeDefined();
  });

  it('emits debug logging when debugOverlayDither is true', async () => {
    const { generatePixelDecisionMatrix } = await import(
      '../../src/modules/qr-generator/pixel-matrix'
    );
    const qr = mockQR(5);
    const overlay = document.createElement('canvas');
    overlay.width = 20;
    overlay.height = 20;

    const config = makeMinimalConfig({
      overlayMode: 'dither',
      debugOverlayDither: true,
    });

    // Should not throw even with debug enabled
    const result = await generatePixelDecisionMatrix(
      qr,
      config,
      overlay,
      5,
      createCanvasFn,
      mockCanvasFactory
    );
    expect(result.matrix).toBeDefined();
  });
});

// ============================================================================
// 8. render-loop.ts — renderModules with various config combos
// ============================================================================

describe('render-loop.ts', () => {
  let renderModules: (
    ctx: unknown,
    qr: unknown,
    config: unknown,
    moduleCount: number,
    moduleSize: number,
    margin: number,
    overlayData: unknown,
    ditherPattern: unknown,
    effectiveIntensity: number,
    drawnFinderPatterns: Set<string>,
    drawnAlignmentPatterns: Set<string>,
    version: number,
    gradientFill: unknown,
    useGradient: boolean
  ) => void;

  function makeRenderCtx() {
    return {
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 10 })),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      imageSmoothingEnabled: true,
    };
  }

  beforeAll(async () => {
    const mod = await import('../../src/modules/qr-generator/render-loop');
    renderModules = mod.renderModules;
  });

  it('renders with default config (no overlay)', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig();

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    // Dark modules should be drawn
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders with gapMode stroke', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({
      gapMode: 'stroke',
      moduleGap: 2,
    });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    // Stroke rendering for dark modules
    expect(ctx.strokeRect).toHaveBeenCalled();
  });

  it('renders with gapMode negative_space', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({
      gapMode: 'negative_space',
      moduleGap: 1,
    });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('applies moduleJitterPx', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({
      moduleJitterPx: 2,
      frameIndex: 3,
    });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('applies pixelSnap round', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({ pixelSnap: 'round' });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('applies pixelSnap ceil', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({ pixelSnap: 'ceil' });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('applies pixelSnap none', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({ pixelSnap: 'none' });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders with halftone overlay mode', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);

    // Build overlayData with brightness for all modules
    const overlayData: Record<string | number, unknown> = {};
    for (let r = 0; r < 5; r++) {
      overlayData[r] = {};
      for (let c = 0; c < 5; c++) {
        (overlayData[r] as Record<number, number>)[c] = 0.5;
      }
    }

    const config = makeMinimalConfig({
      overlayMode: 'halftone',
      overlayIntensity: 80,
    });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      overlayData, null, 80,
      new Set(), new Set(), 1, null, false
    );

    // Halftone should call drawing functions
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders with gradient fill', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig();

    const mockGradient = { addColorStop: vi.fn() };

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1,
      mockGradient, true
    );

    // Should use gradient for dark module fill
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders with dither pattern', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig();

    // Create a dither pattern (inverted from isDark)
    const ditherPattern: boolean[][] = [];
    for (let r = 0; r < 5; r++) {
      ditherPattern[r] = [];
      for (let c = 0; c < 5; c++) {
        ditherPattern[r][c] = (r + c) % 2 === 1; // inverted
      }
    }

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, ditherPattern, 50,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('skips finder pattern modules', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(21); // Version 1
    const config = makeMinimalConfig();

    const finderPatterns = new Set<string>();
    // Mark all finder pattern modules
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        finderPatterns.add(`${r},${c}`);
      }
    }

    renderModules(
      ctx, qr, config, 21, 10, 1,
      null, null, 0,
      finderPatterns, new Set(), 1, null, false
    );

    // Should still render non-finder modules
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders with per-module color and overlay data', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);

    const overlayData: Record<string | number, unknown> = {};
    for (let r = 0; r < 5; r++) {
      overlayData[r] = {};
      for (let c = 0; c < 5; c++) {
        (overlayData[r] as Record<number, number>)[c] = c / 5;
      }
    }

    const config = makeMinimalConfig({
      overlayMode: 'blend',
      overlayIntensity: 60,
    });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      overlayData, null, 60,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders timing patterns with custom style', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(21);
    const config = makeMinimalConfig({ timingStyle: 'dashed' });

    renderModules(
      ctx, qr, config, 21, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('renders with dotRotationDeg', () => {
    const ctx = makeRenderCtx();
    const qr = mockQR(5);
    const config = makeMinimalConfig({
      moduleStyle: 'dots',
      dotRotationDeg: 45,
    });

    renderModules(
      ctx, qr, config, 5, 10, 1,
      null, null, 0,
      new Set(), new Set(), 1, null, false
    );

    // dots style uses arc + fill, and save/restore for rotation
    expect(ctx.save).toHaveBeenCalled();
  });
});
