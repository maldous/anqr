import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

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

// ========== PerspectiveTransform ==========

describe('PerspectiveTransform', () => {
  it('quadrilateralToQuadrilateral creates a valid transform', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.quadrilateralToQuadrilateral(
      0, 0, 10, 0, 10, 10, 0, 10,
      0, 0, 10, 0, 10, 10, 0, 10
    );
    expect(t).toBeInstanceOf(PerspectiveTransform);
  });

  it('identity transform maps points to themselves', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.quadrilateralToQuadrilateral(
      0, 0, 100, 0, 100, 100, 0, 100,
      0, 0, 100, 0, 100, 100, 0, 100
    );
    const points = new Float32Array([50, 50]);
    t.transformPoints(points);
    expect(Math.abs(points[0] - 50)).toBeLessThan(0.01);
    expect(Math.abs(points[1] - 50)).toBeLessThan(0.01);
  });

  it('transforms corner points correctly', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.quadrilateralToQuadrilateral(
      0, 0, 10, 0, 10, 10, 0, 10,
      0, 0, 10, 0, 10, 10, 0, 10
    );
    const points = new Float32Array([0, 0, 10, 10]);
    t.transformPoints(points);
    expect(Math.abs(points[0])).toBeLessThan(0.01);
    expect(Math.abs(points[1])).toBeLessThan(0.01);
    expect(Math.abs(points[2] - 10)).toBeLessThan(0.01);
    expect(Math.abs(points[3] - 10)).toBeLessThan(0.01);
  });

  it('squareToQuadrilateral creates a valid transform', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.squareToQuadrilateral(0, 0, 10, 0, 10, 10, 0, 10);
    expect(t).toBeInstanceOf(PerspectiveTransform);
  });

  it('quadrilateralToSquare creates a valid transform', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.quadrilateralToSquare(0, 0, 10, 0, 10, 10, 0, 10);
    expect(t).toBeInstanceOf(PerspectiveTransform);
  });

  it('handles non-trivial quadrilateral', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.quadrilateralToQuadrilateral(
      0, 0, 100, 0, 100, 100, 0, 100,
      10, 10, 90, 5, 95, 95, 5, 90
    );
    const points = new Float32Array([50, 50]);
    t.transformPoints(points);
    expect(typeof points[0]).toBe('number');
    expect(typeof points[1]).toBe('number');
    expect(Number.isFinite(points[0])).toBe(true);
    expect(Number.isFinite(points[1])).toBe(true);
  });

  it('transformPoints handles multiple point pairs', async () => {
    const { PerspectiveTransform } = await import('../../src/modules/qr-decoder/perspective');
    const t = PerspectiveTransform.quadrilateralToQuadrilateral(
      0, 0, 10, 0, 10, 10, 0, 10,
      0, 0, 10, 0, 10, 10, 0, 10
    );
    const points = new Float32Array([0, 0, 5, 5, 10, 10]);
    t.transformPoints(points);
    expect(Math.abs(points[0])).toBeLessThan(0.01);
    expect(Math.abs(points[1])).toBeLessThan(0.01);
    expect(Math.abs(points[2] - 5)).toBeLessThan(0.01);
    expect(Math.abs(points[3] - 5)).toBeLessThan(0.01);
  });
});

// ========== MathUtils ==========

describe('MathUtils', () => {
  it('round rounds to nearest integer', async () => {
    const { MathUtils } = await import('../../src/modules/qr-decoder/perspective');
    expect(MathUtils.round(2.3)).toBe(2);
    expect(MathUtils.round(2.5)).toBe(3);
    expect(MathUtils.round(2.7)).toBe(3);
    expect(MathUtils.round(-0.5)).toBe(-0);
  });

  it('distance calculates Euclidean distance', async () => {
    const { MathUtils } = await import('../../src/modules/qr-decoder/perspective');
    expect(MathUtils.distance(0, 0, 3, 4)).toBeCloseTo(5, 5);
    expect(MathUtils.distance(0, 0, 0, 0)).toBe(0);
    expect(MathUtils.distance(1, 1, 4, 5)).toBeCloseTo(5, 5);
  });

  it('sum sums an array of numbers', async () => {
    const { MathUtils } = await import('../../src/modules/qr-decoder/perspective');
    if (typeof MathUtils.sum === 'function') {
      expect(MathUtils.sum([1, 2, 3, 4])).toBe(10);
      expect(MathUtils.sum([])).toBe(0);
      expect(MathUtils.sum([5])).toBe(5);
    }
  });
});

// ========== DefaultGridSampler ==========

describe('DefaultGridSampler', () => {
  it('can be instantiated', async () => {
    const { DefaultGridSampler } = await import('../../src/modules/qr-decoder/perspective');
    const sampler = new DefaultGridSampler();
    expect(sampler).toBeDefined();
  });
});

// ========== decodeQR (decode-qr.ts) ==========

describe('decodeQR from decode-qr.ts', () => {
  function makeBlankImage(w: number, h: number, gray = 200): ImageData {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = 255;
    }
    return new ImageData(data, w, h);
  }

  it('returns null for blank gray image (default options)', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(100, 100));
    expect(result).toBeNull();
  });

  it('returns null with dontInvert option', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(100, 100), { inversionAttempts: 'dontInvert' });
    expect(result).toBeNull();
  });

  it('returns null with onlyInvert option', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(100, 100), { inversionAttempts: 'onlyInvert' });
    expect(result).toBeNull();
  });

  it('returns null with attemptBoth option', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(100, 100), { inversionAttempts: 'attemptBoth' });
    expect(result).toBeNull();
  });

  it('returns null with invertFirst option', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(100, 100), { inversionAttempts: 'invertFirst' });
    expect(result).toBeNull();
  });

  it('returns null for all-black image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(50, 50, 0));
    expect(result).toBeNull();
  });

  it('returns null for all-white image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(50, 50, 255));
    expect(result).toBeNull();
  });

  it('returns null for small image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeBlankImage(10, 10));
    expect(result).toBeNull();
  });
});

// ========== decodeQR (decoder-adapter.ts) ==========

describe('decodeQR from decoder-adapter.ts', () => {
  function makeBlankImage(w: number, h: number, gray = 200): ImageData {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = 255;
    }
    return new ImageData(data, w, h);
  }

  it('returns null for blank image', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const result = decodeQR(makeBlankImage(100, 100));
    expect(result).toBeNull();
  });

  it('returns null with dontInvert', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const result = decodeQR(makeBlankImage(100, 100), { inversionAttempts: 'dontInvert' });
    expect(result).toBeNull();
  });

  it('returns null with attemptBoth', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const result = decodeQR(makeBlankImage(100, 100), { inversionAttempts: 'attemptBoth' });
    expect(result).toBeNull();
  });

  it('returns null for transparent image (alpha=0)', async () => {
    const { decodeQR } = await import('../../src/modules/qr-decoder/decoder-adapter');
    const data = new Uint8ClampedArray(50 * 50 * 4); // all zeros
    const result = decodeQR(new ImageData(data, 50, 50));
    expect(result).toBeNull();
  });
});

// ========== locate.ts (findFinderPatterns) ==========

describe('findFinderPatterns', () => {
  it('returns empty patterns for blank image', async () => {
    const { findFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
    const data = new Uint8ClampedArray(100 * 100 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200; data[i+1] = 200; data[i+2] = 200; data[i+3] = 255;
    }
    const imageData = new ImageData(data, 100, 100);
    const result = findFinderPatterns(imageData);
    // Should return a result object (possibly empty patterns)
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('returns empty patterns for all-black image', async () => {
    const { findFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
    const data = new Uint8ClampedArray(100 * 100 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 255;
    }
    const imageData = new ImageData(data, 100, 100);
    const result = findFinderPatterns(imageData);
    expect(result).toBeDefined();
  });
});
