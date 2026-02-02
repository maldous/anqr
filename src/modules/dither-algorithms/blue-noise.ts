/**
 * Blue Noise Generation
 */

import { createLogger } from '../../lib/logger';
import { createRNG } from './utils';

const _log = createLogger('DITHER');

/** Generate blue noise tile using interleaved gradient noise */
export function generateBlueNoiseTile(size: number, seed: number): number[] {
  const tile: number[] = new Array(size * size);
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

  return tile;
}

/** Sample blue noise at position */
export function sampleBlueNoise(x: number, y: number, tile: number[], tileSize: number): number {
  const tx = ((x % tileSize) + tileSize) % tileSize;
  const ty = ((y % tileSize) + tileSize) % tileSize;
  return tile[ty * tileSize + tx];
}
