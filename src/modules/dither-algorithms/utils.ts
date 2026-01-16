/**
 * Dithering Utility Functions
 */

import type { OrderedMatrix } from './types';
import { BAYER_2, BAYER_4, BAYER_8, CLUSTERED_DOT, VOID_CLUSTER } from './matrices';

/** Clamp value to 0-1 range */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Convert RGB to grayscale (0-1) */
export function rgbToGray(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/** Create seeded random number generator - uses linear congruential for better distribution */
export function createRNG(seed: number): () => number {
  let state = seed || Date.now();
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/** Get ordered dithering matrix by name */
export function getOrderedMatrix(name: OrderedMatrix): number[][] {
  switch (name) {
    case 'bayer2':
      return BAYER_2;
    case 'bayer4':
      return BAYER_4;
    case 'bayer8':
      return BAYER_8;
    case 'clustered_dot':
      return CLUSTERED_DOT;
    case 'void_cluster':
      return VOID_CLUSTER;
    default:
      return BAYER_4;
  }
}

/** Convert ImageData to float array format */
export function imageDataToFloat(imageData: ImageData): Float32Array[] {
  const { data, width, height } = imageData;
  const result: Float32Array[] = [];

  for (let y = 0; y < height; y++) {
    const row = new Float32Array(width * 3);
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = x * 3;
      row[dstIdx] = data[srcIdx] / 255;
      row[dstIdx + 1] = data[srcIdx + 1] / 255;
      row[dstIdx + 2] = data[srcIdx + 2] / 255;
    }
    result.push(row);
  }

  return result;
}
