import { grayAt } from './gray-at';
import { DARK_CORE_MODULES } from './dark-core-modules';
import { WHITE_RING_MODULES } from './white-ring-modules';

/**
 * Score a candidate finder pattern center position by measuring contrast
 * between expected dark (center 3x3) and light (surrounding ring) areas.
 *
 * The candidate center (testX, testY) is assumed to be at module position (3.5, 3.5)
 * within the finder pattern. We calculate the finder origin and sample at explicit
 * module center positions to avoid landing on module boundaries.
 */
export function scoreFinderCenter(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  testX: number,
  testY: number,
  moduleSize: number,
  threshold: number
): number {
  // Calculate finder pattern origin (top-left corner of module 0,0)
  // The center is at module position (3.5, 3.5), so origin is 3.5 modules back
  const finderOriginX = testX - 3.5 * moduleSize;
  const finderOriginY = testY - 3.5 * moduleSize;

  // Sample dark core modules (should be black, gray value ~0)
  // Sample at the CENTER of each module (+0.5 offset)
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

  // Sample white ring modules (should be white, gray value ~255)
  // Sample at the CENTER of each module (+0.5 offset)
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

  // Need sufficient samples for reliable scoring
  if (darkCount < 5 || lightCount < 5) return -Infinity;

  const avgDark = darkSum / darkCount;
  const avgLight = lightSum / lightCount;

  // Score is the contrast between light and dark
  // Higher score = better finder pattern match
  const contrast = avgLight - avgDark;

  // Also penalize if dark isn't dark enough or light isn't light enough
  const darkPenalty = avgDark > threshold ? (avgDark - threshold) / 255 : 0;
  const lightPenalty = avgLight < threshold ? (threshold - avgLight) / 255 : 0;

  return contrast - darkPenalty * 100 - lightPenalty * 100;
}
