import { qrDecoderLog } from "./qr-decoder-log";
import { computeFinderContrast } from "./compute-finder-contrast";
import { scoreFinderCenter } from "./score-finder-center";
import { searchGrid } from "./search-grid";

/**
 * Refine a finder pattern center by sampling the expected finder pattern structure
 * and finding the offset that maximizes correlation.
 *
 * The finder pattern is 7x7 modules with structure:
 *   1111111  (row 0)
 *   1000001  (row 1)
 *   1011101  (row 2)
 *   1011101  (row 3)
 *   1011101  (row 4)
 *   1000001  (row 5)
 *   1111111  (row 6)
 *
 * We sample the center 3x3 (should be dark) and surrounding ring (should be light)
 * and find the offset that maximizes the contrast between them.
 */
export function refineFinderPatternCenter(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  moduleSize: number,
  threshold: number,
): { x: number; y: number; score: number } {
  // Search radius in pixels (about 2.5 modules to correct for potential larger offsets)
  const searchRadius = Math.ceil(moduleSize * 2.5);
  const step = Math.max(1, Math.floor(moduleSize / 4));

  const initialScore = scoreFinderCenter(
    pixels,
    width,
    height,
    centerX,
    centerY,
    moduleSize,
    threshold,
  );

  // Coarse pass: search the area around the detected center
  let { bestX, bestY, bestScore } = searchGrid(
    pixels,
    width,
    height,
    centerX,
    centerY,
    moduleSize,
    threshold,
    searchRadius,
    step,
  );

  // Use the initial score if the grid search didn't beat it
  if (initialScore > bestScore) {
    bestScore = initialScore;
    bestX = centerX;
    bestY = centerY;
  }

  // Fine pass: refine with smaller steps around best position (skip if step is already 1)
  if (step > 1) {
    const fineStep = Math.max(1, Math.floor(step / 2));
    const fineRadius = step * 2;

    const fineResult = searchGrid(
      pixels,
      width,
      height,
      bestX,
      bestY,
      moduleSize,
      threshold,
      fineRadius,
      fineStep,
    );

    if (fineResult.bestScore > bestScore) {
      bestScore = fineResult.bestScore;
      bestX = fineResult.bestX;
      bestY = fineResult.bestY;
    }
  }

  // Log refinement result with diagnostic avgDark/avgLight values
  const deltaX = bestX - centerX;
  const deltaY = bestY - centerY;
  const refined = bestScore > initialScore;

  // Compute contrast values at the best position for diagnostic purposes
  const bestContrast = computeFinderContrast(pixels, width, height, bestX, bestY, moduleSize);
  const originalContrast = computeFinderContrast(
    pixels,
    width,
    height,
    centerX,
    centerY,
    moduleSize,
  );

  qrDecoderLog.trace("locate: Finder center refinement", {
    original: `(${centerX.toFixed(1)}, ${centerY.toFixed(1)})`,
    refined: `(${bestX.toFixed(1)}, ${bestY.toFixed(1)})`,
    delta: `(${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`,
    moduleSize: moduleSize.toFixed(1),
    searchRadius,
    step,
    initialScore: initialScore.toFixed(1),
    bestScore: bestScore.toFixed(1),
    scoreImprovement: (bestScore - initialScore).toFixed(1),
    refinementHelped: refined,
    originalAvgDark: originalContrast.avgDark.toFixed(1),
    originalAvgLight: originalContrast.avgLight.toFixed(1),
    bestAvgDark: bestContrast.avgDark.toFixed(1),
    bestAvgLight: bestContrast.avgLight.toFixed(1),
    bestContrast: bestContrast.contrast.toFixed(1),
    note:
      bestContrast.avgDark > 80 || bestContrast.avgLight < 180
        ? "WARNING: Poor contrast suggests finder center still not accurate"
        : "OK - good contrast detected",
  });

  return { x: bestX, y: bestY, score: bestScore };
}
