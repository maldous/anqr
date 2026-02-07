import { describe, expect, it } from 'vitest';
import { applyDither } from '../../src/modules/dither-algorithms';
import type { DitherOptions } from '../../src/modules/dither-algorithms/types';

// Polyfill ImageData for Node environment
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
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

function createImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const value = 32 + x * 20 + y * 15;
      data[idx] = value; // r
      data[idx + 1] = value; // g
      data[idx + 2] = value; // b
      data[idx + 3] = 255; // a
    }
  }
  return { data, width, height } as ImageData;
}

function assertMatrixShape(result: { matrix: boolean[][]; colors: { r: number; g: number; b: number }[][] }, w: number, h: number) {
  expect(result.matrix.length).toBe(h);
  expect(result.colors.length).toBe(h);
  for (let y = 0; y < h; y++) {
    expect(result.matrix[y].length).toBe(w);
    expect(result.colors[y].length).toBe(w);
    for (let x = 0; x < w; x++) {
      const c = result.colors[y][x];
      expect(c.r).toBeGreaterThanOrEqual(0);
      expect(c.r).toBeLessThanOrEqual(255);
      expect(c.g).toBeGreaterThanOrEqual(0);
      expect(c.g).toBeLessThanOrEqual(255);
      expect(c.b).toBeGreaterThanOrEqual(0);
      expect(c.b).toBeLessThanOrEqual(255);
      expect(typeof result.matrix[y][x]).toBe('boolean');
    }
  }
}

describe('dither algorithms', () => {
  it('ordered bayer produces deterministic output shape', () => {
    const imageData = createImageData(4, 4);
    const options: DitherOptions = {
      kind: 'ordered_bayer',
      orderedMatrix: 'bayer2',
      levels: 2,
      strength: 1,
      colorMode: 'grayscale',
    };
    const result = applyDither(imageData, options);
    assertMatrixShape(result, 4, 4);
  });

  it('blue noise with fixed seed is deterministic', () => {
    const imageData = createImageData(4, 4);
    const options: DitherOptions = {
      kind: 'blue_noise',
      levels: 2,
      strength: 1,
      colorMode: 'grayscale',
      blueNoiseSeed: 123,
      blueNoiseTileSize: 4,
    };

    const resultA = applyDither(imageData, options);
    const resultB = applyDither(imageData, options);
    expect(resultA.matrix).toEqual(resultB.matrix);
  });
});
