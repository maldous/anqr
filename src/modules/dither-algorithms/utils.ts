/**
 * Dithering Utility Functions
 */

import { createLogger } from '../../lib/logger';
// Import core utilities from canonical source
import { clamp01, createRNG, rgbToGray } from '../core';
import { BAYER_2, BAYER_4, BAYER_8, CLUSTERED_DOT, VOID_CLUSTER } from './matrices';
import type { OrderedMatrix } from './types';

const _log = createLogger('DITHER');

// Re-export from core for backward compatibility within dither-algorithms
export { clamp01, createRNG, rgbToGray } from '../core';

const BLUE_NOISE_TILE_CACHE_MAX = 64;
const blueNoiseTileCache = new Map<string, Float32Array>();

function getBlueNoiseCacheKey(size: number, seed: number): string {
  return `${size}:${seed}`;
}

/** Generate blue noise tile using interleaved gradient noise */
export function generateBlueNoiseTile(size: number, seed: number): Float32Array {
  const cacheKey = getBlueNoiseCacheKey(size, seed);
  const cached = blueNoiseTileCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const tile = new Float32Array(size * size);
  const phi = 1.618033988749895; // Golden ratio
  const rng = createRNG(seed);
  const offset = rng();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      tile[i] = (offset + i * phi) % 1;
    }
  }

  if (blueNoiseTileCache.size >= BLUE_NOISE_TILE_CACHE_MAX) {
    const oldestKey = blueNoiseTileCache.keys().next().value;
    if (oldestKey) blueNoiseTileCache.delete(oldestKey);
  }
  blueNoiseTileCache.set(cacheKey, tile);

  return tile;
}

/** Sample blue noise at position */
export function sampleBlueNoise(
  x: number,
  y: number,
  tile: ArrayLike<number>,
  tileSize: number
): number {
  const tx = ((x % tileSize) + tileSize) % tileSize;
  const ty = ((y % tileSize) + tileSize) % tileSize;
  return tile[ty * tileSize + tx];
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
