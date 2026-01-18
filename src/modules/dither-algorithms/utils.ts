/**
 * Dithering Utility Functions
 */

// Import core utilities from canonical source
import {
  clamp01 as clamp01FromCore,
  createRNG as createRNGFromCore,
  rgbToGray as rgbToGrayFromCore,
} from '../core';
import { BAYER_2, BAYER_4, BAYER_8, CLUSTERED_DOT, VOID_CLUSTER } from './matrices';
import type { OrderedMatrix } from './types';

// Re-export from core for backward compatibility within dither-algorithms
export const clamp01 = clamp01FromCore;
export const rgbToGray = rgbToGrayFromCore;
export const createRNG = createRNGFromCore;

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
