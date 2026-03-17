import { sampleFinderContrast } from "./sample-finder-contrast";

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
  threshold: number,
): number {
  const { avgDark, avgLight, darkCount, lightCount, contrast } = sampleFinderContrast(
    pixels,
    width,
    height,
    testX,
    testY,
    moduleSize,
  );
  if (darkCount < 5 || lightCount < 5) return -Infinity;

  // Also penalize if dark isn't dark enough or light isn't light enough
  const darkPenalty = avgDark > threshold ? (avgDark - threshold) / 255 : 0;
  const lightPenalty = avgLight < threshold ? (threshold - avgLight) / 255 : 0;

  return contrast - darkPenalty * 100 - lightPenalty * 100;
}
