import { scoreFinderCenter } from "./score-finder-center";

/**
 * Search a grid of candidate positions around a center point, scoring each one.
 * Returns the best position and score found within the grid.
 */
export function searchGrid(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  moduleSize: number,
  threshold: number,
  radius: number,
  step: number,
): { bestX: number; bestY: number; bestScore: number } {
  let bestX = centerX;
  let bestY = centerY;
  let bestScore = -Infinity;

  for (let dy = -radius; dy <= radius; dy += step) {
    for (let dx = -radius; dx <= radius; dx += step) {
      const testX = centerX + dx;
      const testY = centerY + dy;
      const score = scoreFinderCenter(pixels, width, height, testX, testY, moduleSize, threshold);

      if (score > bestScore) {
        bestScore = score;
        bestX = testX;
        bestY = testY;
      }
    }
  }

  return { bestX, bestY, bestScore };
}
