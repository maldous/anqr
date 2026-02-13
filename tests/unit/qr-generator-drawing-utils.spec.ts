import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// ImageData polyfill for node environment (needed by transitive imports)
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

function createMockCtx() {
  const gradientObj = { addColorStop: vi.fn() };
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillStyle: '',
    textAlign: '',
    textBaseline: '',
    font: '',
    createLinearGradient: vi.fn(() => gradientObj),
    createRadialGradient: vi.fn(() => gradientObj),
  } as unknown as CanvasRenderingContext2D;
}

// ========== MemoCache ==========

describe('MemoCache', () => {
  it('returns undefined on cache miss', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<number>(3);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('stores and retrieves values', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<string>(3);
    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    expect(cache.get('a')).toBe('alpha');
    expect(cache.get('b')).toBe('beta');
  });

  it('evicts oldest entry when at capacity', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3); // evicts 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });

  it('LRU reorder: accessing moves entry to most recent', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a'); // moves 'a' to most recent
    cache.set('c', 3); // should evict 'b' (oldest), not 'a'
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
  });

  it('updates value for existing key', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<number>(2);
    cache.set('a', 1);
    cache.set('a', 10);
    expect(cache.get('a')).toBe(10);
  });

  it('clear removes all entries', async () => {
    const { MemoCache } = await import('../../src/modules/qr-generator/cache');
    const cache = new MemoCache<number>(5);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });
});

// ========== validateColor ==========

describe('validateColor', () => {
  it('returns fallback for null', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor(null, '#000')).toBe('#000');
  });

  it('returns fallback for undefined', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor(undefined, '#000')).toBe('#000');
  });

  it('returns fallback for non-string (number)', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor(42, '#000')).toBe('#000');
  });

  it('returns fallback for empty string', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('', '#000')).toBe('#000');
  });

  it('returns fallback for string shorter than 4 chars', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('ab', '#000')).toBe('#000');
    expect(validateColor('red', '#000')).toBe('#000'); // 3 chars too short
  });

  it('accepts valid 3-digit hex', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('#fff', '#000')).toBe('#fff');
  });

  it('accepts valid 6-digit hex', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('#ff00ff', '#000')).toBe('#ff00ff');
  });

  it('accepts valid 8-digit hex (with alpha)', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('#ff00ff80', '#000')).toBe('#ff00ff80');
  });

  it('returns fallback for invalid hex chars', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('#xyz', '#000')).toBe('#000');
    expect(validateColor('#gggggg', '#000')).toBe('#000');
  });

  it('accepts rgb() format', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('rgb(0,0,0)', '#000')).toBe('rgb(0,0,0)');
    expect(validateColor('rgba(255,255,255,0.5)', '#000')).toBe('rgba(255,255,255,0.5)');
  });

  it('accepts hsl() format', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('hsl(0,100%,50%)', '#000')).toBe('hsl(0,100%,50%)');
    expect(validateColor('hsla(0,100%,50%,0.5)', '#000')).toBe('hsla(0,100%,50%,0.5)');
  });

  it('accepts named colors (4+ chars)', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('blue', '#000')).toBe('blue');
    expect(validateColor('coral', '#000')).toBe('coral');
  });

  it('returns fallback for non-alpha, non-hex, non-func strings', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('1234', '#000')).toBe('#000');
    expect(validateColor('12ab', '#000')).toBe('#000');
  });

  it('trims whitespace before checking', async () => {
    const { validateColor } = await import('../../src/modules/qr-generator/utils');
    expect(validateColor('  #fff  ', '#000')).toBe('#fff');
  });
});

// ========== getScaleFactor ==========

describe('getScaleFactor', () => {
  it('returns default render scale for dithered', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('dithered', {} as never)).toBe(18);
  });

  it('returns default render scale for blue-noise', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('blue-noise', {} as never)).toBe(18);
  });

  it('returns default render scale for blue_noise', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('blue_noise', {} as never)).toBe(18);
  });

  it('returns config.subpixelGrid for subpixel', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('subpixel', { subpixelGrid: 5 } as never)).toBe(5);
  });

  it('returns 3 for subpixel when subpixelGrid not set', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('subpixel', {} as never)).toBe(3);
  });

  it('returns config.subpixelGrid for subpixel-size', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('subpixel-size', { subpixelGrid: 4 } as never)).toBe(4);
  });

  it('returns 1 for standard/undefined', async () => {
    const { getScaleFactor } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    expect(getScaleFactor('standard', {} as never)).toBe(1);
    expect(getScaleFactor(undefined, {} as never)).toBe(1);
  });
});

// ========== getEffectiveIntensity ==========

describe('getEffectiveIntensity', () => {
  it('uses default intensity (100) and default ECC limits', async () => {
    const { getEffectiveIntensity } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const result = getEffectiveIntensity({ errorCorrection: 'M' } as never);
    // Default: intensity=1.0, M limit=50/100=0.5 → min(1.0, 0.5) = 0.5
    expect(result.effectiveIntensity).toBe(0.5);
  });

  it('clamps intensity to ECC limit', async () => {
    const { getEffectiveIntensity } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const result = getEffectiveIntensity({ errorCorrection: 'L', overlayIntensity: 80 } as never);
    // intensity=0.8, L limit=30/100=0.3 → min(0.8, 0.3) = 0.3
    expect(result.effectiveIntensity).toBe(0.3);
  });

  it('preserves intensity when below limit', async () => {
    const { getEffectiveIntensity } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const result = getEffectiveIntensity({ errorCorrection: 'H', overlayIntensity: 50 } as never);
    // intensity=0.5, H limit=85/100=0.85 → min(0.5, 0.85) = 0.5
    expect(result.effectiveIntensity).toBe(0.5);
  });

  it('uses custom ECC limits when provided', async () => {
    const { getEffectiveIntensity } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const result = getEffectiveIntensity({
      errorCorrection: 'M',
      overlayIntensity: 80,
      maxOverlayIntensityByEcc: { M: 90 },
    } as never);
    // intensity=0.8, M custom=90/100=0.9 → min(0.8, 0.9) = 0.8
    expect(result.effectiveIntensity).toBe(0.8);
  });

  it('falls back to 50 when ECC level not in limits', async () => {
    const { getEffectiveIntensity } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const result = getEffectiveIntensity({
      errorCorrection: 'X',
      overlayIntensity: 80,
    } as never);
    // intensity=0.8, unknown level → 50/100=0.5 → min(0.8, 0.5) = 0.5
    expect(result.effectiveIntensity).toBe(0.5);
  });

  it('returns effectiveConfig with updated overlayIntensity', async () => {
    const { getEffectiveIntensity } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const result = getEffectiveIntensity({ errorCorrection: 'M', overlayIntensity: 100 } as never);
    expect(result.effectiveConfig.overlayIntensity).toBe(50); // 0.5 * 100
  });
});

// ========== hasPreprocessingOptions ==========

describe('hasPreprocessingOptions', () => {
  it('returns false when no options are set', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({} as never)).toBe(false);
  });

  it('returns false for neutral values', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({
      filterBrightness: 0,
      filterContrast: 0,
      filterSaturation: 0,
      filterHue: 0,
      filterGamma: 1,
      filterInvert: false,
      filterGrayscale: false,
      filterThreshold: 0,
      filterBlur: 0,
      filterSharpen: 0,
      filterPosterize: 0,
      colorMode: 'color',
    } as never)).toBe(false);
  });

  it('returns true for filterBrightness !== 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterBrightness: 10 } as never)).toBe(true);
  });

  it('returns true for filterContrast !== 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterContrast: -10 } as never)).toBe(true);
  });

  it('returns true for filterSaturation !== 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterSaturation: 50 } as never)).toBe(true);
  });

  it('returns true for filterHue !== 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterHue: 90 } as never)).toBe(true);
  });

  it('returns true for filterGamma !== 1', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterGamma: 0.5 } as never)).toBe(true);
  });

  it('returns true for filterInvert', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterInvert: true } as never)).toBe(true);
  });

  it('returns true for filterGrayscale', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterGrayscale: true } as never)).toBe(true);
  });

  it('returns true for filterThreshold > 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterThreshold: 128 } as never)).toBe(true);
  });

  it('returns true for filterBlur > 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterBlur: 2 } as never)).toBe(true);
  });

  it('returns true for filterSharpen > 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterSharpen: 50 } as never)).toBe(true);
  });

  it('returns true for filterPosterize > 0', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterPosterize: 4 } as never)).toBe(true);
  });

  it('returns true for duotone pair', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterDuotone1: '#ff0000', filterDuotone2: '#0000ff' } as never)).toBe(true);
  });

  it('returns false for single duotone color', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterDuotone1: '#ff0000' } as never)).toBe(false);
  });

  it('returns true for filterEdgeDetect', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ filterEdgeDetect: true } as never)).toBe(true);
  });

  it('returns true for colorMode grayscale', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ colorMode: 'grayscale' } as never)).toBe(true);
  });

  it('returns true for colorMode bw', async () => {
    const { hasPreprocessingOptions } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasPreprocessingOptions({ colorMode: 'bw' } as never)).toBe(true);
  });
});

describe('hasGeometricTransforms', () => {
  it('always returns false', async () => {
    const { hasGeometricTransforms } = await import('../../src/modules/qr-generator/overlay-transforms');
    expect(hasGeometricTransforms({} as never)).toBe(false);
    expect(hasGeometricTransforms({ someField: true } as never)).toBe(false);
  });
});

// ========== Drawing Primitives ==========

describe('roundRect', () => {
  it('draws a rounded rectangle on the context', async () => {
    const { roundRect } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    roundRect(ctx, 10, 20, 100, 50, 5);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('clamps radius to half of smaller dimension', async () => {
    const { roundRect } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    roundRect(ctx, 0, 0, 10, 6, 100);
    // radius clamped to min(100, 5, 3) = 3
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
  });
});

describe('drawModule', () => {
  it('draws square (default) style with fillRect', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws square for unknown style', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 5, 5, 8, 'unknown_style');
    expect(ctx.fillRect).toHaveBeenCalledWith(5, 5, 8, 8);
  });

  it('draws rounded style', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'rounded', { cornerRadius: 50 });
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.quadraticCurveTo).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws dots style with arc', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'dots');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws diamond style', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'diamond');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws star style', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'star');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(9); // 10 points total, first is moveTo
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws heart style', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'heart');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.bezierCurveTo).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('applies rotation when specified', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'square', { rotation: 45 });
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalledTimes(2);
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('does not apply rotation when rotation is 0', async () => {
    const { drawModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawModule(ctx, 0, 0, 10, 'square', { rotation: 0 });
    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ctx.rotate).not.toHaveBeenCalled();
  });
});

describe('drawFinderModule', () => {
  it('delegates to drawModule with rotation 0', async () => {
    const { drawFinderModule } = await import('../../src/modules/qr-generator/drawing-primitives');
    const ctx = createMockCtx();
    drawFinderModule(ctx, 0, 0, 10, 'dots', 50);
    expect(ctx.arc).toHaveBeenCalled();
  });
});

// ========== Drawing Halftone ==========

describe('drawHalftoneModule', () => {
  it('draws single circle dot per module by default', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, {} as never);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws square dot shape', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, { halftoneDotShape: 'square' } as never);
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('draws line dot shape', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, { halftoneDotShape: 'line' } as never, 0, 0);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws grid pattern with halftoneCell 2x2', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, { halftoneCell: '2x2' } as never);
    // Grid mode: 2x2 = 4 dots, each calls arc
    expect(ctx.arc).toHaveBeenCalledTimes(4);
  });

  it('parses numeric halftoneCell', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, { halftoneCell: 3 } as never);
    // Grid mode: 3x3 = 9 dots
    expect(ctx.arc).toHaveBeenCalledTimes(9);
  });

  it('uses htCell as fallback for halftoneCell', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, { htCell: '2x2' } as never);
    expect(ctx.arc).toHaveBeenCalledTimes(4);
  });

  it('applies htDot and htCurve config values', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.8, { htDot: 0.5, htCurve: 2 } as never);
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('handles per_module halftoneCell string', async () => {
    const { drawHalftoneModule } = await import('../../src/modules/qr-generator/drawing-halftone');
    const ctx = createMockCtx();
    drawHalftoneModule(ctx, 0, 0, 20, 0.5, { halftoneCell: 'per_module' } as never);
    // per_module → gridSize 1 → single dot
    expect(ctx.arc).toHaveBeenCalledTimes(1);
  });
});

// ========== Drawing Gradients ==========

describe('createGradientFill', () => {
  it('returns null when no gradient config', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    expect(createGradientFill(ctx, {} as never, 100)).toBeNull();
  });

  it('returns null for type none', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    expect(createGradientFill(ctx, { gradient: { type: 'none' } } as never, 100)).toBeNull();
  });

  it('returns null for empty stops', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    expect(createGradientFill(ctx, { gradient: { type: 'linear', stops: [] } } as never, 100)).toBeNull();
  });

  it('creates linear gradient with angle', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    const stops = [{ pos: 0, color: '#000' }, { pos: 1, color: '#fff' }];
    const result = createGradientFill(ctx, { gradient: { type: 'linear', angle: 45, stops } } as never, 200);
    expect(result).not.toBeNull();
    expect(ctx.createLinearGradient).toHaveBeenCalled();
  });

  it('creates radial gradient', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    const stops = [{ pos: 0, color: '#f00' }, { pos: 1, color: '#00f' }];
    const result = createGradientFill(ctx, { gradient: { type: 'radial', stops } } as never, 200);
    expect(result).not.toBeNull();
    expect(ctx.createRadialGradient).toHaveBeenCalled();
  });

  it('creates conic gradient (falls back to radial)', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    const stops = [{ pos: 0, color: '#f00' }, { pos: 1, color: '#0f0' }];
    const result = createGradientFill(ctx, { gradient: { type: 'conic', stops } } as never, 200);
    expect(result).not.toBeNull();
    expect(ctx.createRadialGradient).toHaveBeenCalled();
  });

  it('returns null for unknown gradient type', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    const stops = [{ pos: 0, color: '#000' }];
    expect(createGradientFill(ctx, { gradient: { type: 'unknown', stops } } as never, 100)).toBeNull();
  });

  it('adds color stops to gradient', async () => {
    const { createGradientFill } = await import('../../src/modules/qr-generator/drawing-gradients');
    const ctx = createMockCtx();
    const stops = [{ pos: 0, color: '#000' }, { pos: 0.5, color: '#888' }, { pos: 1, color: '#fff' }];
    const result = createGradientFill(ctx, { gradient: { type: 'linear', angle: 0, stops } } as never, 100);
    expect(result).not.toBeNull();
    // The mock gradient's addColorStop should be called 3 times
    if (result) {
      expect((result as { addColorStop: ReturnType<typeof vi.fn> }).addColorStop).toHaveBeenCalledTimes(3);
    }
  });
});

// ========== Drawing Frames ==========

describe('drawFrameBackground', () => {
  it('returns early when frameStyle is undefined', async () => {
    const { drawFrameBackground } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrameBackground(ctx, 200, 10, 4, {} as never);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('returns early when frameStyle is none', async () => {
    const { drawFrameBackground } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrameBackground(ctx, 200, 10, 4, { frameStyle: 'none' } as never);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it('draws fillRect when no borderRadius', async () => {
    const { drawFrameBackground } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrameBackground(ctx, 200, 10, 4, { frameStyle: 'sticker', bgColor: '#fff' } as never);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 200, 200);
  });

  it('draws roundRect when borderRadius > 0', async () => {
    const { drawFrameBackground } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrameBackground(ctx, 200, 10, 4, { frameStyle: 'sticker', frameBorderRadius: 50, bgColor: '#fff' } as never);
    // roundRect calls beginPath + quadraticCurveTo
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.quadraticCurveTo).toHaveBeenCalled();
  });
});

describe('drawFrame', () => {
  it('returns early when frameStyle is undefined', async () => {
    const { drawFrame } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrame(ctx, 200, 10, 4, {} as never);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('returns early when frameStyle is none', async () => {
    const { drawFrame } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrame(ctx, 200, 10, 4, { frameStyle: 'none' } as never);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('returns early when no frameText', async () => {
    const { drawFrame } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrame(ctx, 200, 10, 4, { frameStyle: 'sticker' } as never);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('draws text when frameStyle and frameText are set', async () => {
    const { drawFrame } = await import('../../src/modules/qr-generator/drawing-frames');
    const ctx = createMockCtx();
    drawFrame(ctx, 200, 10, 4, { frameStyle: 'sticker', frameText: 'SCAN ME', fgColor: '#000' } as never);
    expect(ctx.fillText).toHaveBeenCalled();
  });
});

// ========== applyTrueDither ==========

describe('applyTrueDither', () => {
  it('produces boolean matrix and null colors in bw mode', async () => {
    const { applyTrueDither } = await import('../../src/modules/qr-generator/dithering-true');
    const w = 3;
    const h = 2;
    const data = new Uint8ClampedArray(w * h * 4);
    // Pixel (0,0): black (dark)
    data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 255;
    // Pixel (1,0): white (light)
    data[4] = 255; data[5] = 255; data[6] = 255; data[7] = 255;
    // Pixel (2,0): mid gray
    data[8] = 128; data[9] = 128; data[10] = 128; data[11] = 255;
    // Row 2 all mid-gray
    for (let i = 12; i < 24; i += 4) { data[i] = 100; data[i+1] = 100; data[i+2] = 100; data[i+3] = 255; }

    const result = applyTrueDither(data, w, h, { colorMode: 'bw' } as never);
    expect(result.matrix.length).toBe(h);
    expect(result.matrix[0].length).toBe(w);
    // Black pixel → dark
    expect(result.matrix[0][0]).toBe(true);
    // White pixel → light
    expect(result.matrix[0][1]).toBe(false);
    // All colors are null in bw mode
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        expect(result.colors[y][x]).toBeNull();
      }
    }
  });

  it('produces RGB colors in color mode', async () => {
    const { applyTrueDither } = await import('../../src/modules/qr-generator/dithering-true');
    const data = new Uint8ClampedArray(4);
    data[0] = 200; data[1] = 100; data[2] = 50; data[3] = 255;
    const result = applyTrueDither(data, 1, 1, { colorMode: 'color' } as never);
    expect(result.colors[0][0]).not.toBeNull();
    expect(result.colors[0][0]!.r).toBe(200);
    expect(result.colors[0][0]!.g).toBe(100);
    expect(result.colors[0][0]!.b).toBe(50);
  });

  it('handles grayscale mode (non-bw gives colors)', async () => {
    const { applyTrueDither } = await import('../../src/modules/qr-generator/dithering-true');
    const data = new Uint8ClampedArray(4);
    data[0] = 80; data[1] = 80; data[2] = 80; data[3] = 255;
    const result = applyTrueDither(data, 1, 1, { colorMode: 'grayscale' } as never);
    expect(result.colors[0][0]).not.toBeNull();
    expect(result.matrix[0][0]).toBe(true); // dark (gray < 128)
  });
});

// ========== normalizeColors ==========

describe('normalizeColors', () => {
  it('returns all-null matrix when colors is undefined', async () => {
    const { normalizeColors } = await import('../../src/modules/qr-generator/pixel-matrix-dither');
    const result = normalizeColors(undefined, 2);
    expect(result.length).toBe(2);
    for (let r = 0; r < 2; r++) {
      expect(result[r].length).toBe(2);
      for (let c = 0; c < 2; c++) {
        expect(result[r][c]).toBeNull();
      }
    }
  });

  it('maps existing colors to RGB objects', async () => {
    const { normalizeColors } = await import('../../src/modules/qr-generator/pixel-matrix-dither');
    const colors: Record<number, Record<number, { r: number; g: number; b: number }>> = {
      0: { 0: { r: 255, g: 0, b: 0 }, 1: { r: 0, g: 255, b: 0 } },
      1: { 0: { r: 0, g: 0, b: 255 } },
    };
    const result = normalizeColors(colors, 2);
    expect(result[0][0]).toEqual({ r: 255, g: 0, b: 0 });
    expect(result[0][1]).toEqual({ r: 0, g: 255, b: 0 });
    expect(result[1][0]).toEqual({ r: 0, g: 0, b: 255 });
    expect(result[1][1]).toBeNull(); // missing entry
  });

  it('returns null for missing row', async () => {
    const { normalizeColors } = await import('../../src/modules/qr-generator/pixel-matrix-dither');
    const result = normalizeColors({}, 3);
    expect(result[0][0]).toBeNull();
    expect(result[2][2]).toBeNull();
  });
});
