import { grayAt } from './gray-at';
import { DARK_CORE_MODULES } from './dark-core-modules';
import { WHITE_RING_MODULES } from './white-ring-modules';

/**
 * Compute the average dark and light values at a candidate finder center.
 * Used for diagnostic logging to verify sampling is hitting module centers.
 */
export function computeFinderContrast(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  testX: number,
  testY: number,
  moduleSize: number
): { avgDark: number; avgLight: number; contrast: number } {
  // Calculate finder pattern origin (top-left corner of module 0,0)
  const finderOriginX = testX - 3.5 * moduleSize;
  const finderOriginY = testY - 3.5 * moduleSize;

  // Sample dark core modules
  let darkSum = 0;
  let darkCount = 0;
  for (const [col, row] of DARK_CORE_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      darkSum += grayAt(pixels, idx);
      darkCount++;
    }
  }

  // Sample white ring modules
  let lightSum = 0;
  let lightCount = 0;
  for (const [col, row] of WHITE_RING_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      lightSum += grayAt(pixels, idx);
      lightCount++;
    }
  }

  const avgDark = darkCount > 0 ? darkSum / darkCount : 127;
  const avgLight = lightCount > 0 ? lightSum / lightCount : 127;
  const contrast = avgLight - avgDark;

  return { avgDark, avgLight, contrast };
}
