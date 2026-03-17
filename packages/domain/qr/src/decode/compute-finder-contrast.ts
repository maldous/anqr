import { sampleFinderContrast } from "./sample-finder-contrast";

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
  moduleSize: number,
): { avgDark: number; avgLight: number; contrast: number } {
  const { avgDark, avgLight, contrast } = sampleFinderContrast(
    pixels,
    width,
    height,
    testX,
    testY,
    moduleSize,
  );
  return { avgDark, avgLight, contrast };
}
