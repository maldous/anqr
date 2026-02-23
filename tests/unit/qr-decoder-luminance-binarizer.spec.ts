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

// Polyfill ImageData for Node environment
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, w: number, h: number) {
    this.data = data;
    this.width = w;
    this.height = h;
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

describe('RGBALuminanceSource', () => {
  it('constructs from raw luminance array', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([0, 128, 255, 64]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    expect(source.getWidth()).toBe(2);
    expect(source.getHeight()).toBe(2);
  });

  it('getRow returns correct luminance values', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([10, 20, 30, 40, 50, 60]);
    const source = new RGBALuminanceSource(luminances, 3, 2);
    const row0 = source.getRow(0);
    expect(row0[0]).toBe(10);
    expect(row0[1]).toBe(20);
    expect(row0[2]).toBe(30);
    const row1 = source.getRow(1);
    expect(row1[0]).toBe(40);
    expect(row1[1]).toBe(50);
    expect(row1[2]).toBe(60);
  });

  it('getRow reuses provided buffer when large enough', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([10, 20, 30, 40]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    const buffer = new Uint8ClampedArray(5);
    const row = source.getRow(0, buffer);
    expect(row[0]).toBe(10);
    expect(row[1]).toBe(20);
  });

  it('getRow creates new buffer when too small', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([10, 20, 30, 40]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    const tinyBuffer = new Uint8ClampedArray(1);
    const row = source.getRow(0, tinyBuffer);
    expect(row.length).toBe(2);
  });

  it('getMatrix returns full luminance data', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([10, 20, 30, 40]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    const matrix = source.getMatrix();
    expect(matrix).toBe(luminances);
  });

  it('isCropSupported returns false', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    expect(source.isCropSupported()).toBe(false);
  });

  it('isRotateSupported returns false', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    expect(source.isRotateSupported()).toBe(false);
  });

  it('crop throws UnsupportedOperationException', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    expect(() => source.crop(0, 0, 1, 1)).toThrow();
  });

  it('rotateCounterClockwise throws UnsupportedOperationException', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    expect(() => source.rotateCounterClockwise()).toThrow();
  });

  it('rotateCounterClockwise45 throws UnsupportedOperationException', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    expect(() => source.rotateCounterClockwise45()).toThrow();
  });

  it('invert returns an InvertedLuminanceSource', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray([100, 200]), 2, 1);
    const inverted = source.invert();
    expect(inverted).toBeInstanceOf(InvertedLuminanceSource);
  });

  it('toString produces text representation', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    // Values: 0x00 (<0x40 = '#'), 0x60 (<0x80 = '+'), 0xA0 (<0xC0 = '.'), 0xF0 (>= 0xC0 = ' ')
    const luminances = new Uint8ClampedArray([0x00, 0x60, 0xa0, 0xf0]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    const str = source.toString();
    expect(str).toContain('#');
    expect(str).toContain('+');
    expect(str).toContain('.');
    expect(str).toContain(' ');
  });

  it('createFromImageData converts RGBA to grayscale', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    // 2x1 image: pure red (255,0,0,255) and pure green (0,255,0,255)
    const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    const imageData = new ImageData(data, 2, 1);
    const source = RGBALuminanceSource.createFromImageData(imageData);
    expect(source.getWidth()).toBe(2);
    expect(source.getHeight()).toBe(1);
    const row = source.getRow(0);
    // Red: 0.299*255 + 0.587*0 + 0.114*0 ≈ 76
    expect(row[0]).toBeCloseTo(76, 0);
    // Green: 0.299*0 + 0.587*255 + 0.114*0 ≈ 150
    expect(row[1]).toBeCloseTo(150, 0);
  });
});

describe('InvertedLuminanceSource', () => {
  it('inverts getRow values', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([0, 100, 200, 255]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    const inverted = new InvertedLuminanceSource(source);
    const row = inverted.getRow(0);
    expect(row[0]).toBe(255);
    expect(row[1]).toBe(155);
  });

  it('inverts getMatrix values', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const luminances = new Uint8ClampedArray([0, 100, 200, 255]);
    const source = new RGBALuminanceSource(luminances, 2, 2);
    const inverted = new InvertedLuminanceSource(source);
    const matrix = inverted.getMatrix();
    expect(matrix[0]).toBe(255);
    expect(matrix[1]).toBe(155);
    expect(matrix[2]).toBe(55);
    expect(matrix[3]).toBe(0);
  });

  it('invert returns original source', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const original = new RGBALuminanceSource(new Uint8ClampedArray([100]), 1, 1);
    const inverted = new InvertedLuminanceSource(original);
    const uninverted = inverted.invert();
    expect(uninverted).toBe(original);
  });

  it('delegates isCropSupported', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    const inverted = new InvertedLuminanceSource(source);
    expect(inverted.isCropSupported()).toBe(false);
  });

  it('delegates isRotateSupported', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    const inverted = new InvertedLuminanceSource(source);
    expect(inverted.isRotateSupported()).toBe(false);
  });

  it('getWidth and getHeight return correct dimensions', async () => {
    const { RGBALuminanceSource, InvertedLuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(6), 3, 2);
    const inverted = new InvertedLuminanceSource(source);
    expect(inverted.getWidth()).toBe(3);
    expect(inverted.getHeight()).toBe(2);
  });
});

describe('BinaryBitmap', () => {
  it('wraps a binarizer and exposes dimensions', async () => {
    const { BinaryBitmap, RGBALuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const luminances = new Uint8ClampedArray(100);
    for (let i = 0; i < 100; i++) luminances[i] = i < 50 ? 0 : 255;
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const binarizer = new GlobalHistogramBinarizer(source);
    const bitmap = new BinaryBitmap(binarizer);
    expect(bitmap.getWidth()).toBe(10);
    expect(bitmap.getHeight()).toBe(10);
  });

  it('throws on null binarizer', async () => {
    const { BinaryBitmap } = await import('../../src/modules/qr-decoder/luminance');
    expect(() => new BinaryBitmap(null as any)).toThrow();
  });

  it('isCropSupported delegates to source', async () => {
    const { BinaryBitmap, RGBALuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(source));
    expect(bitmap.isCropSupported()).toBe(false);
  });

  it('isRotateSupported delegates to source', async () => {
    const { BinaryBitmap, RGBALuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(source));
    expect(bitmap.isRotateSupported()).toBe(false);
  });

  it('toString returns string representation', async () => {
    const { BinaryBitmap, RGBALuminanceSource } =
      await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    // Create a high-contrast image so histogram can find bimodal distribution
    const size = 100;
    const luminances = new Uint8ClampedArray(size);
    for (let i = 0; i < size; i++) luminances[i] = i < size / 2 ? 10 : 240;
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(source));
    const str = bitmap.toString();
    expect(typeof str).toBe('string');
  });
});

describe('GlobalHistogramBinarizer', () => {
  it('creates from luminance source', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const luminances = new Uint8ClampedArray(100);
    for (let i = 0; i < 100; i++) luminances[i] = i < 50 ? 10 : 240;
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const binarizer = new GlobalHistogramBinarizer(source);
    expect(binarizer.getWidth()).toBe(10);
    expect(binarizer.getHeight()).toBe(10);
  });

  it('getBlackMatrix returns a BitMatrix for high-contrast image', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const size = 100;
    const luminances = new Uint8ClampedArray(size);
    // Left half dark, right half light
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        luminances[y * 10 + x] = x < 5 ? 10 : 240;
      }
    }
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const binarizer = new GlobalHistogramBinarizer(source);
    const matrix = binarizer.getBlackMatrix();
    expect(matrix).toBeDefined();
    expect(matrix.getWidth()).toBe(10);
    expect(matrix.getHeight()).toBe(10);
    // Dark pixels should be set
    expect(matrix.get(0, 0)).toBe(true);
    // Light pixels should not be set
    expect(matrix.get(9, 0)).toBe(false);
  });

  it('getBlackRow returns a BitArray', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const size = 100;
    const luminances = new Uint8ClampedArray(size);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        luminances[y * 10 + x] = x < 5 ? 10 : 240;
      }
    }
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const binarizer = new GlobalHistogramBinarizer(source);
    const { BitArray } = await import('../../src/modules/qr-decoder/bit-matrix');
    const row = binarizer.getBlackRow(0, new BitArray(10));
    expect(row.getSize()).toBe(10);
  });

  it('getBlackRow handles narrow images (width < 3)', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const luminances = new Uint8ClampedArray([10, 240]);
    const source = new RGBALuminanceSource(luminances, 2, 1);
    const binarizer = new GlobalHistogramBinarizer(source);
    const { BitArray } = await import('../../src/modules/qr-decoder/bit-matrix');
    const row = binarizer.getBlackRow(0, new BitArray(2));
    expect(row.getSize()).toBe(2);
  });

  it('createBinarizer creates a new GlobalHistogramBinarizer', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    const binarizer = new GlobalHistogramBinarizer(source);
    const newBinarizer = binarizer.createBinarizer(source);
    expect(newBinarizer).toBeInstanceOf(GlobalHistogramBinarizer);
  });

  it('handles flat (no contrast) image', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { GlobalHistogramBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    // All same value → may throw NotFoundException or return a matrix
    const luminances = new Uint8ClampedArray(100).fill(128);
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const binarizer = new GlobalHistogramBinarizer(source);
    try {
      const matrix = binarizer.getBlackMatrix();
      expect(matrix).toBeDefined();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});

describe('HybridBinarizer', () => {
  it('creates from luminance source', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const size = 40 * 40;
    const luminances = new Uint8ClampedArray(size);
    for (let i = 0; i < size; i++) luminances[i] = i % 2 === 0 ? 10 : 240;
    const source = new RGBALuminanceSource(luminances, 40, 40);
    const binarizer = new HybridBinarizer(source);
    expect(binarizer.getWidth()).toBe(40);
    expect(binarizer.getHeight()).toBe(40);
  });

  it('getBlackMatrix returns BitMatrix for large enough image', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    // Image must be >= 40x40 (BLOCK_SIZE * 5 = 8 * 5 = 40)
    const w = 48;
    const h = 48;
    const size = w * h;
    const luminances = new Uint8ClampedArray(size);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        luminances[y * w + x] = x < w / 2 ? 10 : 240;
      }
    }
    const source = new RGBALuminanceSource(luminances, w, h);
    const binarizer = new HybridBinarizer(source);
    const matrix = binarizer.getBlackMatrix();
    expect(matrix).toBeDefined();
    expect(matrix.getWidth()).toBe(w);
    expect(matrix.getHeight()).toBe(h);
  });

  it('caches getBlackMatrix result', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const w = 48;
    const h = 48;
    const luminances = new Uint8ClampedArray(w * h);
    for (let i = 0; i < luminances.length; i++) luminances[i] = i % 2 === 0 ? 10 : 240;
    const source = new RGBALuminanceSource(luminances, w, h);
    const binarizer = new HybridBinarizer(source);
    const matrix1 = binarizer.getBlackMatrix();
    const matrix2 = binarizer.getBlackMatrix();
    expect(matrix1).toBe(matrix2);
  });

  it('falls back to GlobalHistogramBinarizer for small images', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    // Image smaller than MINIMUM_DIMENSION (40)
    const luminances = new Uint8ClampedArray(100);
    for (let i = 0; i < 100; i++) luminances[i] = i < 50 ? 10 : 240;
    const source = new RGBALuminanceSource(luminances, 10, 10);
    const binarizer = new HybridBinarizer(source);
    const matrix = binarizer.getBlackMatrix();
    expect(matrix).toBeDefined();
  });

  it('createBinarizer creates a new HybridBinarizer', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    const source = new RGBALuminanceSource(new Uint8ClampedArray(4), 2, 2);
    const binarizer = new HybridBinarizer(source);
    const newBinarizer = binarizer.createBinarizer(source);
    expect(newBinarizer).toBeInstanceOf(HybridBinarizer);
  });

  it('handles image with low dynamic range blocks', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    // Create image with some uniform blocks (low dynamic range ≤ 24)
    const w = 48;
    const h = 48;
    const luminances = new Uint8ClampedArray(w * h);
    // First quadrant: all dark (uniform)
    for (let y = 0; y < h / 2; y++) {
      for (let x = 0; x < w / 2; x++) {
        luminances[y * w + x] = 20;
      }
    }
    // Second quadrant: high contrast
    for (let y = 0; y < h / 2; y++) {
      for (let x = w / 2; x < w; x++) {
        luminances[y * w + x] = x % 2 === 0 ? 10 : 240;
      }
    }
    // Third quadrant: all light (uniform)
    for (let y = h / 2; y < h; y++) {
      for (let x = 0; x < w / 2; x++) {
        luminances[y * w + x] = 230;
      }
    }
    // Fourth quadrant: gradual gradient
    for (let y = h / 2; y < h; y++) {
      for (let x = w / 2; x < w; x++) {
        luminances[y * w + x] = Math.floor((x / w) * 255);
      }
    }
    const source = new RGBALuminanceSource(luminances, w, h);
    const binarizer = new HybridBinarizer(source);
    const matrix = binarizer.getBlackMatrix();
    expect(matrix.getWidth()).toBe(w);
    expect(matrix.getHeight()).toBe(h);
  });

  it('handles image where early high-range breaks out of inner loop', async () => {
    const { RGBALuminanceSource } = await import('../../src/modules/qr-decoder/luminance');
    const { HybridBinarizer } = await import('../../src/modules/qr-decoder/binarizer');
    // Create image where the first row of each block has extreme values
    // This triggers the early break path in calculateBlackPoints
    const w = 48;
    const h = 48;
    const luminances = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // First pixel in each 8x8 block is 0, second is 255 → high dynamic range
        const blockLocal = (y % 8) * 8 + (x % 8);
        luminances[y * w + x] = blockLocal === 0 ? 0 : blockLocal === 1 ? 255 : 128;
      }
    }
    const source = new RGBALuminanceSource(luminances, w, h);
    const binarizer = new HybridBinarizer(source);
    const matrix = binarizer.getBlackMatrix();
    expect(matrix.getWidth()).toBe(w);
  });
});

describe('qr-decoder extract.ts', () => {
  describe('calculateLocation', () => {
    it('calculates location from 3 finder patterns', async () => {
      const { calculateLocation } = await import('../../src/modules/qr-decoder/extract');
      // Version 1 (21x21), module size ~5px
      // Finder centers at (17.5, 17.5), (87.5, 17.5), (17.5, 87.5)
      const topLeft = { center: { x: 17.5, y: 17.5 }, moduleSize: 5, count: 10 };
      const topRight = { center: { x: 87.5, y: 17.5 }, moduleSize: 5, count: 10 };
      const bottomLeft = { center: { x: 17.5, y: 87.5 }, moduleSize: 5, count: 10 };
      const location = calculateLocation(topLeft, topRight, bottomLeft);
      expect(location.moduleCount).toBe(21);
      expect(location.moduleSize).toBeCloseTo(5, 0);
      expect(location.bottomRight).toBeDefined();
      expect(location.bottomRight.x).toBeCloseTo(87.5, 0);
      expect(location.bottomRight.y).toBeCloseTo(87.5, 0);
    });

    it('calculates correct version for v2', async () => {
      const { calculateLocation } = await import('../../src/modules/qr-decoder/extract');
      // Version 2 (25x25), module size ~4px
      // Distance between finder centers = (25-7) * 4 = 72px
      const topLeft = { center: { x: 14, y: 14 }, moduleSize: 4, count: 5 };
      const topRight = { center: { x: 86, y: 14 }, moduleSize: 4, count: 5 };
      const bottomLeft = { center: { x: 14, y: 86 }, moduleSize: 4, count: 5 };
      const location = calculateLocation(topLeft, topRight, bottomLeft);
      expect(location.moduleCount).toBe(25);
    });

    it('clamps version to valid range', async () => {
      const { calculateLocation } = await import('../../src/modules/qr-decoder/extract');
      // Very small patterns → version clamped to 1
      const topLeft = { center: { x: 3.5, y: 3.5 }, moduleSize: 1, count: 1 };
      const topRight = { center: { x: 10.5, y: 3.5 }, moduleSize: 1, count: 1 };
      const bottomLeft = { center: { x: 3.5, y: 10.5 }, moduleSize: 1, count: 1 };
      const location = calculateLocation(topLeft, topRight, bottomLeft);
      expect(location.moduleCount).toBeGreaterThanOrEqual(21);
    });
  });

  describe('extractModuleMatrix', () => {
    it('extracts matrix from synthetic ImageData', async () => {
      const { extractModuleMatrix, calculateLocation } =
        await import('../../src/modules/qr-decoder/extract');
      // Create a 105x105 black image (v1, moduleSize=5)
      const w = 105;
      const h = 105;
      const data = new Uint8ClampedArray(w * h * 4);
      // Fill with black (all zeros already, alpha=255)
      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = 255;
      }
      const imageData = new ImageData(data, w, h);
      const topLeft = { center: { x: 17.5, y: 17.5 }, moduleSize: 5, count: 10 };
      const topRight = { center: { x: 87.5, y: 17.5 }, moduleSize: 5, count: 10 };
      const bottomLeft = { center: { x: 17.5, y: 87.5 }, moduleSize: 5, count: 10 };
      const location = calculateLocation(topLeft, topRight, bottomLeft);
      const matrix = extractModuleMatrix(imageData, location, 128);
      expect(matrix.length).toBe(21);
      expect(matrix[0].length).toBe(21);
      // All black with threshold 128 → all modules should be dark
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          expect(matrix[r][c]).toBe(true);
        }
      }
    });

    it('handles transparent pixels as light modules', async () => {
      const { extractModuleMatrix, calculateLocation } =
        await import('../../src/modules/qr-decoder/extract');
      // Create a fully transparent image
      const w = 105;
      const h = 105;
      const data = new Uint8ClampedArray(w * h * 4); // all zeros including alpha
      const imageData = new ImageData(data, w, h);
      const topLeft = { center: { x: 17.5, y: 17.5 }, moduleSize: 5, count: 10 };
      const topRight = { center: { x: 87.5, y: 17.5 }, moduleSize: 5, count: 10 };
      const bottomLeft = { center: { x: 17.5, y: 87.5 }, moduleSize: 5, count: 10 };
      const location = calculateLocation(topLeft, topRight, bottomLeft);
      const matrix = extractModuleMatrix(imageData, location, 128);
      // Transparent → composited over white → gray 255 → light
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          expect(matrix[r][c]).toBe(false);
        }
      }
    });
  });
});

describe('qr-decoder locate.ts', () => {
  describe('findFinderPatterns', () => {
    it('returns empty patterns for uniform image', async () => {
      const { findFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
      // Uniform gray image → no patterns
      const w = 100;
      const h = 100;
      const data = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
      const imageData = new ImageData(data, w, h);
      const result = findFinderPatterns(imageData);
      expect(result.patterns).toBeDefined();
      expect(result.threshold).toBeGreaterThan(0);
    });

    it('handles fully transparent image', async () => {
      const { findFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
      const w = 50;
      const h = 50;
      const data = new Uint8ClampedArray(w * h * 4);
      const imageData = new ImageData(data, w, h);
      const result = findFinderPatterns(imageData);
      expect(result.patterns).toBeDefined();
      expect(result.threshold).toBeGreaterThan(0);
    });
  });

  describe('selectFinderPatterns', () => {
    it('returns null for fewer than 3 patterns', async () => {
      const { selectFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
      expect(selectFinderPatterns([])).toBeNull();
      expect(
        selectFinderPatterns([{ center: { x: 0, y: 0 }, moduleSize: 5, count: 1 }])
      ).toBeNull();
      expect(
        selectFinderPatterns([
          { center: { x: 0, y: 0 }, moduleSize: 5, count: 1 },
          { center: { x: 100, y: 0 }, moduleSize: 5, count: 1 },
        ])
      ).toBeNull();
    });

    it('selects 3 patterns that form a square', async () => {
      const { selectFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
      const patterns = [
        { center: { x: 17.5, y: 17.5 }, moduleSize: 5, count: 10 },
        { center: { x: 87.5, y: 17.5 }, moduleSize: 5, count: 10 },
        { center: { x: 17.5, y: 87.5 }, moduleSize: 5, count: 10 },
      ];
      const result = selectFinderPatterns(patterns);
      expect(result).not.toBeNull();
      expect(result!.length).toBe(3);
      // Should be ordered: [topLeft, topRight, bottomLeft]
      const [tl, tr, bl] = result!;
      // topLeft should be the one at the right angle
      expect(tl.center.x).toBeLessThan(tr.center.x);
      expect(tl.center.y).toBeLessThan(bl.center.y);
    });

    it('rejects patterns with very different module sizes', async () => {
      const { selectFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
      const patterns = [
        { center: { x: 17.5, y: 17.5 }, moduleSize: 5, count: 10 },
        { center: { x: 87.5, y: 17.5 }, moduleSize: 15, count: 10 },
        { center: { x: 17.5, y: 87.5 }, moduleSize: 5, count: 10 },
      ];
      const result = selectFinderPatterns(patterns);
      // Module size variance > 0.3 → rejected
      expect(result).toBeNull();
    });

    it('selects best triplet from 4+ patterns', async () => {
      const { selectFinderPatterns } = await import('../../src/modules/qr-decoder/locate');
      const patterns = [
        { center: { x: 17.5, y: 17.5 }, moduleSize: 5, count: 10 },
        { center: { x: 87.5, y: 17.5 }, moduleSize: 5, count: 10 },
        { center: { x: 17.5, y: 87.5 }, moduleSize: 5, count: 10 },
        { center: { x: 50, y: 50 }, moduleSize: 5, count: 2 }, // noise
      ];
      const result = selectFinderPatterns(patterns);
      expect(result).not.toBeNull();
      expect(result!.length).toBe(3);
    });
  });
});
