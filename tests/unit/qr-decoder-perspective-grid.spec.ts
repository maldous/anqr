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

describe('PerspectiveTransform', () => {
  async function getModule() {
    return import('../../src/modules/qr-decoder/perspective');
  }

  describe('squareToQuadrilateral', () => {
    it('creates identity-like transform for unit square mapped to itself', async () => {
      const { PerspectiveTransform } = await getModule();
      // Map unit square to itself: (0,0)→(0,0), (1,0)→(1,0), (1,1)→(1,1), (0,1)→(0,1)
      const transform = PerspectiveTransform.squareToQuadrilateral(0, 0, 1, 0, 1, 1, 0, 1);
      const points = new Float32Array([0.5, 0.5]);
      transform.transformPoints(points);
      expect(points[0]).toBeCloseTo(0.5, 3);
      expect(points[1]).toBeCloseTo(0.5, 3);
    });

    it('creates affine transform (dx3=dy3=0 branch)', async () => {
      const { PerspectiveTransform } = await getModule();
      // Parallelogram: (0,0), (2,0), (3,1), (1,1) → dx3 = 0-2+3-1 = 0, dy3 = 0-0+1-1 = 0
      const transform = PerspectiveTransform.squareToQuadrilateral(0, 0, 2, 0, 3, 1, 1, 1);
      const origin = new Float32Array([0, 0]);
      transform.transformPoints(origin);
      expect(origin[0]).toBeCloseTo(0, 3);
      expect(origin[1]).toBeCloseTo(0, 3);
    });

    it('handles non-affine (perspective) quadrilateral', async () => {
      const { PerspectiveTransform } = await getModule();
      // Trapezoid: (10,10), (90,10), (80,90), (20,90)
      // dx3 = 10-90+80-20 = -20 ≠ 0, so perspective branch taken
      const transform = PerspectiveTransform.squareToQuadrilateral(10, 10, 90, 10, 80, 90, 20, 90);
      const points = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
      transform.transformPoints(points);
      // Corners should map approximately to the quadrilateral corners
      expect(points[0]).toBeCloseTo(10, 0);
      expect(points[1]).toBeCloseTo(10, 0);
      expect(points[2]).toBeCloseTo(90, 0);
      expect(points[3]).toBeCloseTo(10, 0);
      expect(points[4]).toBeCloseTo(80, 0);
      expect(points[5]).toBeCloseTo(90, 0);
      expect(points[6]).toBeCloseTo(20, 0);
      expect(points[7]).toBeCloseTo(90, 0);
    });
  });

  describe('quadrilateralToQuadrilateral', () => {
    it('maps one quadrilateral to another', async () => {
      const { PerspectiveTransform } = await getModule();
      // Map from (0,0),(100,0),(100,100),(0,100) to (10,10),(90,10),(90,90),(10,90)
      const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
        0,
        0,
        100,
        0,
        100,
        100,
        0,
        100, // source
        10,
        10,
        90,
        10,
        90,
        90,
        10,
        90 // dest
      );
      // Center (50,50) should map to (50,50)
      const center = new Float32Array([50, 50]);
      transform.transformPoints(center);
      expect(center[0]).toBeCloseTo(50, 0);
      expect(center[1]).toBeCloseTo(50, 0);
    });

    it('maps corners correctly', async () => {
      const { PerspectiveTransform } = await getModule();
      const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
        0,
        0,
        100,
        0,
        100,
        100,
        0,
        100,
        20,
        20,
        80,
        20,
        80,
        80,
        20,
        80
      );
      const corners = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
      transform.transformPoints(corners);
      expect(corners[0]).toBeCloseTo(20, 0);
      expect(corners[1]).toBeCloseTo(20, 0);
      expect(corners[2]).toBeCloseTo(80, 0);
      expect(corners[3]).toBeCloseTo(20, 0);
      expect(corners[4]).toBeCloseTo(80, 0);
      expect(corners[5]).toBeCloseTo(80, 0);
      expect(corners[6]).toBeCloseTo(20, 0);
      expect(corners[7]).toBeCloseTo(80, 0);
    });
  });

  describe('transformPointsWithValues', () => {
    it('transforms separate x/y arrays', async () => {
      const { PerspectiveTransform } = await getModule();
      const transform = PerspectiveTransform.squareToQuadrilateral(0, 0, 10, 0, 10, 10, 0, 10);
      const xValues = new Float32Array([0, 1, 0.5]);
      const yValues = new Float32Array([0, 1, 0.5]);
      transform.transformPointsWithValues(xValues, yValues);
      expect(xValues[0]).toBeCloseTo(0, 1);
      expect(yValues[0]).toBeCloseTo(0, 1);
      expect(xValues[1]).toBeCloseTo(10, 1);
      expect(yValues[1]).toBeCloseTo(10, 1);
      expect(xValues[2]).toBeCloseTo(5, 1);
      expect(yValues[2]).toBeCloseTo(5, 1);
    });
  });
});

describe('DefaultGridSampler', () => {
  async function getModule() {
    return import('../../src/modules/qr-decoder/perspective');
  }

  async function getBitMatrix() {
    return import('../../src/modules/qr-decoder/bit-matrix');
  }

  it('samples a grid with identity-like transform', async () => {
    const { DefaultGridSampler, PerspectiveTransform } = await getModule();
    const { BitMatrix } = await getBitMatrix();
    const sampler = new DefaultGridSampler();

    // Create a 10x10 bit matrix with a checkered pattern
    const source = new BitMatrix(10, 10);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if ((x + y) % 2 === 0) source.set(x, y);
      }
    }

    // Sample the same grid
    const transform = PerspectiveTransform.quadrilateralToQuadrilateral(
      0.5,
      0.5,
      9.5,
      0.5,
      9.5,
      9.5,
      0.5,
      9.5,
      0.5,
      0.5,
      9.5,
      0.5,
      9.5,
      9.5,
      0.5,
      9.5
    );
    const result = sampler.sampleGridWithTransform(source, 10, 10, transform);
    expect(result.getWidth()).toBe(10);
    expect(result.getHeight()).toBe(10);
  });

  it('throws NotFoundException for zero dimension', async () => {
    const { DefaultGridSampler, PerspectiveTransform } = await getModule();
    const { BitMatrix } = await getBitMatrix();
    const { NotFoundException } = await import('../../src/modules/qr-decoder/exceptions');
    const sampler = new DefaultGridSampler();
    const source = new BitMatrix(10, 10);
    const transform = PerspectiveTransform.squareToQuadrilateral(0, 0, 10, 0, 10, 10, 0, 10);

    expect(() => sampler.sampleGridWithTransform(source, 0, 10, transform)).toThrow(
      NotFoundException
    );
  });

  it('sampleGrid delegates to sampleGridWithTransform', async () => {
    const { DefaultGridSampler } = await getModule();
    const { BitMatrix } = await getBitMatrix();
    const sampler = new DefaultGridSampler();

    const source = new BitMatrix(21, 21);
    // Set some modules
    for (let i = 0; i < 7; i++) {
      source.set(i, 0);
      source.set(0, i);
    }

    const result = sampler.sampleGrid(
      source,
      21,
      21,
      0.5,
      0.5,
      20.5,
      0.5,
      20.5,
      20.5,
      0.5,
      20.5,
      0.5,
      0.5,
      20.5,
      0.5,
      20.5,
      20.5,
      0.5,
      20.5
    );
    expect(result.getWidth()).toBe(21);
    expect(result.getHeight()).toBe(21);
  });
});

describe('MathUtils', () => {
  it('round works like Math.round', async () => {
    const { MathUtils } = await import('../../src/modules/qr-decoder/perspective');
    expect(MathUtils.round(1.4)).toBe(1);
    expect(MathUtils.round(1.5)).toBe(2);
    expect(MathUtils.round(1.6)).toBe(2);
    expect(MathUtils.round(-0.5)).toBe(-0); // Math.round(-0.5) returns -0 in IEEE 754
  });

  it('distance calculates Euclidean distance', async () => {
    const { MathUtils } = await import('../../src/modules/qr-decoder/perspective');
    expect(MathUtils.distance(0, 0, 3, 4)).toBeCloseTo(5, 5);
    expect(MathUtils.distance(0, 0, 0, 0)).toBe(0);
    expect(MathUtils.distance(1, 1, 4, 5)).toBeCloseTo(5, 5);
  });

  it('sum adds all elements of Int32Array', async () => {
    const { MathUtils } = await import('../../src/modules/qr-decoder/perspective');
    expect(MathUtils.sum(new Int32Array([1, 2, 3, 4]))).toBe(10);
    expect(MathUtils.sum(new Int32Array([]))).toBe(0);
    expect(MathUtils.sum(new Int32Array([-1, 1]))).toBe(0);
  });
});
