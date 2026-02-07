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

interface FinderPattern {
  center: { x: number; y: number };
  moduleSize: number;
  count: number;
}

function mkPattern(x: number, y: number, moduleSize: number, count = 5): FinderPattern {
  return { center: { x, y }, moduleSize, count };
}

function createWhiteImageData(width: number, height: number): InstanceType<typeof MockImageData> {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
  return new MockImageData(data, width, height);
}

function createBlackImageData(width: number, height: number): InstanceType<typeof MockImageData> {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 255;
  }
  return new MockImageData(data, width, height);
}

describe('qr-decoder/extract.ts', () => {
  describe('calculateLocation', () => {
    async function getCalcLocation() {
      const mod = await import('../../src/modules/qr-decoder/extract');
      return mod.calculateLocation;
    }

    it('calculates v1 QR (21 modules) with moduleSize=6', async () => {
      const calcLoc = await getCalcLocation();
      // Finder centers at (3.5, 3.5) from each corner
      // For v1 (21 modules, moduleSize=6): 21*6 = 126px total
      // TL center at (3.5*6, 3.5*6) = (21, 21)
      // TR center at ((21-3.5)*6, 3.5*6) = (105, 21)
      // BL center at (3.5*6, (21-3.5)*6) = (21, 105)
      const tl = mkPattern(21, 21, 6);
      const tr = mkPattern(105, 21, 6);
      const bl = mkPattern(21, 105, 6);

      const loc = calcLoc(tl, tr, bl);

      expect(loc.moduleCount).toBe(21);
      expect(loc.moduleSize).toBeCloseTo(6, 1);
      expect(loc.topLeft).toEqual({ x: 21, y: 21 });
      expect(loc.topRight).toEqual({ x: 105, y: 21 });
      expect(loc.bottomLeft).toEqual({ x: 21, y: 105 });
    });

    it('calculates v5 QR (37 modules) with moduleSize=4', async () => {
      const calcLoc = await getCalcLocation();
      // v5: 37 modules, moduleSize=4
      // Module span between finder centers: 37 - 7 = 30 modules
      // TL center: (3.5*4, 3.5*4) = (14, 14)
      // TR center: ((37-3.5)*4, 3.5*4) = (134, 14)
      // BL center: (3.5*4, (37-3.5)*4) = (14, 134)
      const tl = mkPattern(14, 14, 4);
      const tr = mkPattern(134, 14, 4);
      const bl = mkPattern(14, 134, 4);

      const loc = calcLoc(tl, tr, bl);

      expect(loc.moduleCount).toBe(37);
      expect(loc.moduleSize).toBeCloseTo(4, 1);
    });

    it('handles slightly uneven distances (topDist != leftDist)', async () => {
      const calcLoc = await getCalcLocation();
      // Slightly off-square: TR is a bit closer
      const tl = mkPattern(21, 21, 6);
      const tr = mkPattern(103, 21, 6); // slightly closer
      const bl = mkPattern(21, 107, 6); // slightly farther

      const loc = calcLoc(tl, tr, bl);

      // Should still detect version 1 (moduleCount=21) since avg is close
      expect(loc.moduleCount).toBe(21);
      expect(loc.moduleSize).toBeCloseTo(6, 0);
    });

    it('extrapolates bottomRight correctly', async () => {
      const calcLoc = await getCalcLocation();
      const tl = mkPattern(21, 21, 6);
      const tr = mkPattern(105, 21, 6);
      const bl = mkPattern(21, 105, 6);

      const loc = calcLoc(tl, tr, bl);

      // bottomRight = topRight + (bottomLeft - topLeft)
      expect(loc.bottomRight.x).toBeCloseTo(105 + (21 - 21), 0);
      expect(loc.bottomRight.y).toBeCloseTo(21 + (105 - 21), 0);
    });

    it('clamps version to valid range (1-40)', async () => {
      const calcLoc = await getCalcLocation();
      // Very tiny finder patterns → tiny distance → version should be clamped to 1
      const tl = mkPattern(5, 5, 1);
      const tr = mkPattern(12, 5, 1);
      const bl = mkPattern(5, 12, 1);

      const loc = calcLoc(tl, tr, bl);

      expect(loc.moduleCount).toBeGreaterThanOrEqual(21); // version 1 minimum
    });

    it('handles rotated QR code (diagonal finders)', async () => {
      const calcLoc = await getCalcLocation();
      // 45-degree rotated: finders form a diamond shape
      const tl = mkPattern(100, 10, 6);
      const tr = mkPattern(190, 100, 6);
      const bl = mkPattern(10, 100, 6);

      const loc = calcLoc(tl, tr, bl);

      expect(loc.moduleCount).toBeGreaterThanOrEqual(21);
      expect(loc.bottomRight).toBeDefined();
    });

    it('averages module sizes from all 3 patterns', async () => {
      const calcLoc = await getCalcLocation();
      const tl = mkPattern(21, 21, 5.5);
      const tr = mkPattern(105, 21, 6.0);
      const bl = mkPattern(21, 105, 6.5);

      const loc = calcLoc(tl, tr, bl);

      expect(loc.moduleSize).toBeCloseTo(6, 0); // average of 5.5, 6.0, 6.5
    });
  });

  describe('extractModuleMatrix', () => {
    async function getExtract() {
      const mod = await import('../../src/modules/qr-decoder/extract');
      return mod.extractModuleMatrix;
    }

    it('extracts 21x21 matrix from simple QR image', async () => {
      const extract = await getExtract();
      const size = 210; // 21 modules * 10px each
      const img = createWhiteImageData(size, size);

      const location = {
        topLeft: { x: 35, y: 35 },    // 3.5 * 10
        topRight: { x: 175, y: 35 },   // (21-3.5) * 10
        bottomLeft: { x: 35, y: 175 }, // 3.5, (21-3.5) * 10
        bottomRight: { x: 175, y: 175 },
        moduleSize: 10,
        moduleCount: 21,
      };

      const matrix = extract(img as unknown as ImageData, location, 128);

      expect(matrix.length).toBe(21);
      expect(matrix[0].length).toBe(21);
      // All white → all modules should be false (light)
      for (const row of matrix) {
        for (const val of row) {
          expect(val).toBe(false);
        }
      }
    });

    it('extracts dark modules from black image', async () => {
      const extract = await getExtract();
      const size = 210;
      const img = createBlackImageData(size, size);

      const location = {
        topLeft: { x: 35, y: 35 },
        topRight: { x: 175, y: 35 },
        bottomLeft: { x: 35, y: 175 },
        bottomRight: { x: 175, y: 175 },
        moduleSize: 10,
        moduleCount: 21,
      };

      const matrix = extract(img as unknown as ImageData, location, 128);

      expect(matrix.length).toBe(21);
      // All black → all modules should be true (dark)
      for (const row of matrix) {
        for (const val of row) {
          expect(val).toBe(true);
        }
      }
    });

    it('handles transparent pixels (alpha=0 → treated as white/light)', async () => {
      const extract = await getExtract();
      const size = 210;
      const data = new Uint8ClampedArray(size * size * 4);
      // All transparent (alpha=0)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;     // R
        data[i + 1] = 0;  // G
        data[i + 2] = 0;  // B
        data[i + 3] = 0;  // A = transparent
      }
      const img = new MockImageData(data, size, size);

      const location = {
        topLeft: { x: 35, y: 35 },
        topRight: { x: 175, y: 35 },
        bottomLeft: { x: 35, y: 175 },
        bottomRight: { x: 175, y: 175 },
        moduleSize: 10,
        moduleCount: 21,
      };

      const matrix = extract(img as unknown as ImageData, location, 128);

      // Transparent → composited over white → all light
      for (const row of matrix) {
        for (const val of row) {
          expect(val).toBe(false);
        }
      }
    });

    it('handles semi-transparent pixels', async () => {
      const extract = await getExtract();
      const size = 210;
      const data = new Uint8ClampedArray(size * size * 4);
      // Semi-transparent black (alpha=128)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 128; // ~50% transparent → composites to ~127 gray
      }
      const img = new MockImageData(data, size, size);

      const location = {
        topLeft: { x: 35, y: 35 },
        topRight: { x: 175, y: 35 },
        bottomLeft: { x: 35, y: 175 },
        bottomRight: { x: 175, y: 175 },
        moduleSize: 10,
        moduleCount: 21,
      };

      const matrix = extract(img as unknown as ImageData, location, 128);

      expect(matrix.length).toBe(21);
      // Semi-transparent black → gray ~127 → depends on threshold
    });

    it('handles small image with out-of-bounds sampling', async () => {
      const extract = await getExtract();
      const size = 50; // Very small image
      const img = createBlackImageData(size, size);

      const location = {
        topLeft: { x: 10, y: 10 },
        topRight: { x: 200, y: 10 },  // Way outside image
        bottomLeft: { x: 10, y: 200 }, // Way outside image
        bottomRight: { x: 200, y: 200 },
        moduleSize: 10,
        moduleCount: 21,
      };

      const matrix = extract(img as unknown as ImageData, location, 128);

      // Should not throw - out of bounds returns white (255)
      expect(matrix.length).toBe(21);
      expect(matrix[0].length).toBe(21);
    });

    it('handles mixed dark/light checkerboard pattern', async () => {
      const extract = await getExtract();
      const size = 210;
      const data = new Uint8ClampedArray(size * size * 4);
      // Create a 10px checkerboard (each module is 10px)
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const moduleRow = Math.floor(y / 10);
          const moduleCol = Math.floor(x / 10);
          const isDark = (moduleRow + moduleCol) % 2 === 0;
          const idx = (y * size + x) * 4;
          const val = isDark ? 0 : 255;
          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        }
      }
      const img = new MockImageData(data, size, size);

      const location = {
        topLeft: { x: 35, y: 35 },
        topRight: { x: 175, y: 35 },
        bottomLeft: { x: 35, y: 175 },
        bottomRight: { x: 175, y: 175 },
        moduleSize: 10,
        moduleCount: 21,
      };

      const matrix = extract(img as unknown as ImageData, location, 128);

      expect(matrix.length).toBe(21);
      // Should have a mix of dark and light modules
      const hasDark = matrix.some(row => row.some(v => v));
      const hasLight = matrix.some(row => row.some(v => !v));
      expect(hasDark).toBe(true);
      expect(hasLight).toBe(true);
    });
  });
});

describe('qr-decoder/decode-qr.ts', () => {
  describe('decodeQR', () => {
    async function getDecodeQR() {
      const mod = await import('../../src/modules/qr-decoder/decode-qr');
      return mod.decodeQR;
    }

    it('returns null for blank white image', async () => {
      const decodeQR = await getDecodeQR();
      const img = createWhiteImageData(100, 100);
      const result = decodeQR(img as unknown as ImageData);
      expect(result).toBeNull();
    });

    it('returns null for blank black image', async () => {
      const decodeQR = await getDecodeQR();
      const img = createBlackImageData(100, 100);
      const result = decodeQR(img as unknown as ImageData);
      expect(result).toBeNull();
    });

    it('returns null with inversionAttempts=dontInvert for blank image', async () => {
      const decodeQR = await getDecodeQR();
      const img = createWhiteImageData(100, 100);
      const result = decodeQR(img as unknown as ImageData, { inversionAttempts: 'dontInvert' });
      expect(result).toBeNull();
    });

    it('returns null with inversionAttempts=onlyInvert for blank image', async () => {
      const decodeQR = await getDecodeQR();
      const img = createWhiteImageData(100, 100);
      const result = decodeQR(img as unknown as ImageData, { inversionAttempts: 'onlyInvert' });
      expect(result).toBeNull();
    });

    it('returns null with inversionAttempts=attemptBoth for blank image', async () => {
      const decodeQR = await getDecodeQR();
      const img = createWhiteImageData(100, 100);
      const result = decodeQR(img as unknown as ImageData, { inversionAttempts: 'attemptBoth' });
      expect(result).toBeNull();
    });

    it('handles very small image gracefully (no crash)', async () => {
      const decodeQR = await getDecodeQR();
      const img = createWhiteImageData(5, 5);
      const result = decodeQR(img as unknown as ImageData);
      expect(result).toBeNull();
    });

    it('handles 1x1 image gracefully', async () => {
      const decodeQR = await getDecodeQR();
      const img = createWhiteImageData(1, 1);
      const result = decodeQR(img as unknown as ImageData);
      expect(result).toBeNull();
    });

    it('handles uniform gray image', async () => {
      const decodeQR = await getDecodeQR();
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
      const img = new MockImageData(data, size, size);
      const result = decodeQR(img as unknown as ImageData);
      expect(result).toBeNull();
    });

    it('handles image with random noise', async () => {
      const decodeQR = await getDecodeQR();
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      // Deterministic "random" pattern using simple math
      for (let i = 0; i < data.length; i += 4) {
        const pixel = i / 4;
        const val = ((pixel * 37 + 73) * 131) % 256;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      const img = new MockImageData(data, size, size);
      const result = decodeQR(img as unknown as ImageData);
      expect(result).toBeNull();
    });

    it('exercises invertImageData path via onlyInvert', async () => {
      const decodeQR = await getDecodeQR();
      const img = createBlackImageData(100, 100);
      // onlyInvert inverts the image (black → white), then tries to decode
      const result = decodeQR(img as unknown as ImageData, { inversionAttempts: 'onlyInvert' });
      expect(result).toBeNull();
    });

    it('exercises both normal and inverted via attemptBoth', async () => {
      const decodeQR = await getDecodeQR();
      const size = 100;
      const data = new Uint8ClampedArray(size * size * 4);
      // Half white, half black
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const val = x < size / 2 ? 0 : 255;
          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        }
      }
      const img = new MockImageData(data, size, size);
      const result = decodeQR(img as unknown as ImageData, { inversionAttempts: 'attemptBoth' });
      expect(result).toBeNull();
    });
  });
});
