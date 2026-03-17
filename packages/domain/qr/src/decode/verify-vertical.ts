import { isFinderPatternRatio } from "./is-finder-pattern-ratio";
import { scanUpward } from "./scan-upward";
import { scanDownward } from "./scan-downward";

/**
 * Verify a potential finder pattern by checking vertically
 */
export function verifyVertical(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  expectedModuleSize: number,
  threshold: number,
): { valid: boolean; center: number; moduleSize: number } {
  const counts = [0, 0, 0, 0, 0];

  // Scan up from center
  scanUpward(pixels, width, x, Math.floor(y), threshold, counts);

  // Scan down from center (start one row below to avoid double-counting the center row)
  scanDownward(pixels, width, height, x, Math.floor(y) + 1, threshold, counts);

  if (!isFinderPatternRatio(counts)) {
    return { valid: false, center: y, moduleSize: expectedModuleSize };
  }

  const total = counts.reduce((a, b) => a + b, 0);
  const moduleSize = total / 7;
  const moduleSizeError = Math.abs(moduleSize - expectedModuleSize);

  if (moduleSizeError > expectedModuleSize * 0.5) {
    return { valid: false, center: y, moduleSize: expectedModuleSize };
  }

  const newCenter = y + (counts[3] + counts[4] - counts[0] - counts[1]) / 2;

  return { valid: true, center: newCenter, moduleSize };
}
