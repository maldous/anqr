import { grayAt } from './gray-at';
import { advanceVerticalScanState } from './advance-vertical-scan-state';

/**
 * Scan upward from startY, populating counts[2], counts[1], counts[0].
 * Scans the center dark region, then the white ring, then the outer dark border.
 */
export function scanUpward(
  pixels: Uint8ClampedArray,
  width: number,
  x: number,
  startY: number,
  threshold: number,
  counts: number[]
): void {
  let state = 2;

  for (let row = startY; row >= 0; row--) {
    const idx = (row * width + Math.floor(x)) * 4;
    const gray = grayAt(pixels, idx);
    const isDark = gray < threshold;
    state = advanceVerticalScanState(isDark, state, counts, 2, 1, 0);
    if (state === -1) break;
  }
}
