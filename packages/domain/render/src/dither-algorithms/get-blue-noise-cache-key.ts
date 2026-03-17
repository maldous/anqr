export function getBlueNoiseCacheKey(size: number, seed: number): string {
  return `${size}:${seed}`;
}
