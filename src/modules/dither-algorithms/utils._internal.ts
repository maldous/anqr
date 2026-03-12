export const BLUE_NOISE_TILE_CACHE_MAX = 64;

export const blueNoiseTileCache = new Map<string, Float32Array>();

export function getBlueNoiseCacheKey(size: number, seed: number): string {
  return `${size}:${seed}`;
}
