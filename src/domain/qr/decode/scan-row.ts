import { grayAt } from "./gray-at";
import { isFinderPatternRatio } from "./is-finder-pattern-ratio";
import { handleDarkPixel } from "./handle-dark-pixel";
import { handleLightPixel } from "./handle-light-pixel";
import type { ScanResult } from "./scan-result";

/**
 * Scan a row for potential finder patterns
 */
export function scanRow(
  pixels: Uint8ClampedArray,
  width: number,
  y: number,
  threshold: number,
): ScanResult[] {
  const results: ScanResult[] = [];
  const counts = [0, 0, 0, 0, 0];
  let state = 0;

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const gray = grayAt(pixels, idx);
    const isDark = gray < threshold;

    if (isDark) {
      state = handleDarkPixel(state, counts);
    } else {
      state = handleLightPixel(state, counts, x, results);
    }
  }

  // Check final state
  if (state === 4 && isFinderPatternRatio(counts)) {
    const total = counts.reduce((a, b) => a + b, 0);
    const center = width - total / 2;
    results.push({
      center,
      moduleSize: total / 7,
    });
  }

  return results;
}
