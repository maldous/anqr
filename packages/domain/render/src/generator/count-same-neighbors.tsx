import { pixelIndex } from "./pixel-index";

export function countSameNeighbors(
  copy: Uint8Array,
  x: number,
  y: number,
  scaledSize: number,
  current: number,
): number {
  let count = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (ox === 0 && oy === 0) continue;
      if (copy[pixelIndex(x + ox, y + oy, scaledSize)] === current) count++;
    }
  }
  return count;
}
