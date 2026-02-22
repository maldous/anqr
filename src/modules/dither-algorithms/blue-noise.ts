/**
 * Blue Noise Generation
 */

import { createLogger } from '../../lib/logger';
import { createRNG } from './utils';

const _log = createLogger('DITHER');

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
      // Interleaved gradient noise with golden ratio offset
      const i = y * size + x;
      const noise = (offset + i * phi) % 1;
      tile[i] = noise;
    }
  }

  if (blueNoiseTileCache.size >= BLUE_NOISE_TILE_CACHE_MAX) {
    const oldestKey = blueNoiseTileCache.keys().next().value;
    if (oldestKey) {
      blueNoiseTileCache.delete(oldestKey);
    }
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

export function clearBlueNoiseTileCache(): void {
  blueNoiseTileCache.clear();
}
