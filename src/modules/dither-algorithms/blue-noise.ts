/**
 * Blue Noise Generation
 */

import { createRNG } from './utils';

/** Generate blue noise tile using interleaved gradient noise */
export function generateBlueNoiseTile(size: number, seed: number): number[] {
  const tile: number[] = new Array(size * size);
  const phi = 1.618033988749895; // Golden ratio
  const rng = createRNG(seed);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Interleaved gradient noise formula
      const ign = (52.9829189 * ((0.06711056 * x + 0.00583715 * y) % 1)) % 1;
      // Add golden ratio based offset for better distribution
      const offset = ((x * phi + y * phi * phi) % 1) + rng() * 0.1;
      // Combine and normalize
      tile[y * size + x] = (ign + offset * 0.5) % 1;
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
