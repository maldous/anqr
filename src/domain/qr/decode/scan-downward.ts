import { grayAt } from './gray-at';
import { advanceVerticalScanState } from './advance-vertical-scan-state';

/**
 * Scan downward from startY, populating counts[2], counts[3], counts[4].
 * Scans the center dark region, then the white ring, then the outer dark border.
 */
export function scanDownward(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  startY: number,
  threshold: number,
  counts: number[]
): void {
  let state = 2;

  for (let row = startY; row < height; row++) {
    const idx = (row * width + Math.floor(x)) * 4;
    const gray = grayAt(pixels, idx);
    const isDark = gray < threshold;
    state = advanceVerticalScanState(isDark, state, counts, 2, 3, 4);
    if (state === -1) break;
  }
}
