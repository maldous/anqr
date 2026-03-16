import { generateBlueNoiseTile } from "../dither";
import { MAX_DITHER_STATIC_STATES } from "./max-dither-static-states";
import { blueNoiseTileCache } from "./blue-noise-tile-cache";

export function getBlueNoiseTileCached(
  tileSize: number,
  seed: number,
): ReturnType<typeof generateBlueNoiseTile> {
  const key = `${tileSize}:${seed}`;
  const existing = blueNoiseTileCache.get(key);
  if (existing) return existing;
  const tile = generateBlueNoiseTile(tileSize, seed);
  blueNoiseTileCache.set(key, tile);
  if (blueNoiseTileCache.size > MAX_DITHER_STATIC_STATES) {
    const oldestKey = blueNoiseTileCache.keys().next().value;
    if (oldestKey) blueNoiseTileCache.delete(oldestKey);
  }
  return tile;
}
