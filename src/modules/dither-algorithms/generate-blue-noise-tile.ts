import { createRNG } from '../../domain/render/primitives/math';
import { blueNoiseTileCache } from './blue-noise-tile-cache';
import { BLUE_NOISE_TILE_CACHE_MAX } from './blue-noise-tile-cache-max';
import { getBlueNoiseCacheKey } from './get-blue-noise-cache-key';

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
