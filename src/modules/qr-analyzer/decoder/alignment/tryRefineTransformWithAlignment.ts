import {QRLocation, best, bestScore, bottom, bottomLeft, center, col, cx, dark, denom, dstPts, dx, dy, for, i, imageData, j, location, patterns, right, row, s, score, searchRadius, srcPts, step, t, topLeft, topRight, total, u, v, valid, x, y} from '../shared';
import { getAlignmentPatternPositions } from '../alignment/getAlignmentPatternPositions';
import { scoreAlignmentPatternAt } from '../alignment/scoreAlignmentPatternAt';
import { solveHomography } from '../transform/solveHomography';
/**
 * Try to find the bottom-right-most alignment pattern in image space, then recompute the homography
 * using TL/TR/BL finder centers plus the found alignment center. This avoids relying on a synthetic bottomRight.
 */
export function tryRefineTransformWithAlignment(
  imageData: ImageData,
  location: QRLocation,
  moduleCount: number,
  version: number,
  provisionalTransform: (col: number, row: number) => Point,
  moduleSizePx: number
): ((col: number, row: number) => Point) | null {
  if (version < 2) return null;

  const positions = getAlignmentPatternPositions(version);
  if (!positions || positions.length === 0) return null;

  // Pick the bottom-right-most valid alignment (largest row+col) that doesn't overlap finder patterns.
  let bestExpected: { row: number; col: number } | null = null;
  const moduleCountMinus9 = moduleCount - 9;

  for (let i = positions.length - 1; i >= 0; i--) {
    for (let j = positions.length - 1; j >= 0; j--) {
      const row = positions[i];
      const col = positions[j];

      // Skip those near finder patterns
      const nearTL = row <= 8 && col <= 8;
      const nearTR = row <= 8 && col >= moduleCountMinus9;
      const nearBL = row >= moduleCountMinus9 && col <= 8;
      if (nearTL || nearTR || nearBL) continue;

      bestExpected = { row, col };
      break;
    }
    if (bestExpected) break;
  }

  if (!bestExpected) return null;

  // Search around the expected alignment center in image space for the best 5x5 alignment pattern.
  const approx = provisionalTransform(bestExpected.col, bestExpected.row);
  const searchRadius = Math.max(2, Math.round(moduleSizePx * 2.0));
  const step = Math.max(1, Math.round(moduleSizePx * 0.4));

  let bestScore = -1;
  let bestPt: Point | null = null;

  for (let dy = -searchRadius; dy <= searchRadius; dy += step) {
    for (let dx = -searchRadius; dx <= searchRadius; dx += step) {
      const cx = approx.x + dx;
      const cy = approx.y + dy;
      const s = scoreAlignmentPatternAt(imageData, cx, cy, moduleSizePx);
      if (s > bestScore) {
        bestScore = s;
        bestPt = { x: cx, y: cy };
      }
    }
  }

  // Require a decent match (alignment is 5x5 with a dark border + dark center => 25 modules total)
  if (!bestPt || bestScore < 16) {
    debugLog(`refineTransform: alignment NOT found (bestScore=${bestScore}/25)`);
    return null;
  }

  debugLog(`refineTransform: alignment found score=${bestScore}/25`);

  // Recompute homography using TL/TR/BL finder centers + alignment center.
  // Note: homography coordinates are in "module-center space" (i.e., u=col+0.5, v=row+0.5).
  const srcPts: Point[] = [
    { x: 3.5, y: 3.5 },
    { x: moduleCount - 3.5, y: 3.5 },
    { x: 3.5, y: moduleCount - 3.5 },
    { x: bestExpected.col + 0.5, y: bestExpected.row + 0.5 },
  ];

  const dstPts: Point[] = [location.topLeft, location.topRight, location.bottomLeft, bestPt];

  const h = solveHomography(srcPts, dstPts);

  return (col: number, row: number): Point => {
    const u = col + 0.5;
    const v = row + 0.5;

    const denom = h[6] * u + h[7] * v + 1.0;
    if (Math.abs(denom) < 1e-9) return { x: 0, y: 0 };

    const x = (h[0] * u + h[1] * v + h[2]) / denom;
    const y = (h[3] * u + h[4] * v + h[5]) / denom;

    return { x, y };
  };
}

