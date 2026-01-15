import {A, X, c, candidate, center, dark, for, moduleSize, px, py, score, w} from '../shared';
import { getFinderPatternExpected } from '../finder/getFinderPatternExpected';
/**
 * Score a finder pattern candidate by checking the actual 7x7 structure
 * Returns a numerical score 0-100 based on how well the pattern matches
 * 
 * A finder pattern is 7x7 modules:
 * XXXXXXX (dark)
 * X.....X
 * X.XXX.X
 * X.XXX.X
 * X.XXX.X
 * X.....X
 * XXXXXXX
 * Where X=dark, .=light
 */
export function scoreFinderPatternAt(
  binary: boolean[],
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  moduleSize: number
): number {
  // Score by sampling the full 7x7 finder template (49 modules) in image space.
  // This reduces false positives versus sparse-point scoring, and is still cheap.
  //
  // We use weighted matches to emphasize the most discriminative cells:
  // - corners + outer border (high importance)
  // - inner light ring (high importance)
  // - center 3x3 (high importance)
  const sample = (mx: number, my: number): boolean | null => {
    const px = Math.round(centerX + mx * moduleSize);
    const py = Math.round(centerY + my * moduleSize);
    if (px < 0 || px >= width || py < 0 || py >= height) return null;
    return binary[py * width + px];
  };

  // Early reject if center is not dark (very strong constraint)
  const centerVal = sample(0, 0);
  if (centerVal !== true) return 0;

  let matchW = 0;
  let totalW = 0;

  for (let r = -3; r <= 3; r++) {
    const localRow = r + 3;
    for (let c = -3; c <= 3; c++) {
      const localCol = c + 3;
      const expected = getFinderPatternExpected(localRow, localCol);
      const actual = sample(c, r);
      if (actual === null) return 0;

      // Weighting
      let w = 1;
      const isCorner = (Math.abs(r) === 3 && Math.abs(c) === 3);
      const isOuterBorder = (Math.abs(r) === 3 || Math.abs(c) === 3);
      const isInnerRing = (Math.abs(r) === 2 || Math.abs(c) === 2) && !isOuterBorder;
      const isCenter3 = (Math.abs(r) <= 1 && Math.abs(c) <= 1);

      if (isCorner) w = 4;
      else if (isOuterBorder) w = 2;
      else if (isInnerRing) w = 2;
      else if (isCenter3) w = 3;

      totalW += w;
      if (actual === expected) matchW += w;
    }
  }

  const score = Math.round((matchW * 100) / Math.max(1, totalW));
  return Math.max(0, Math.min(100, score));
}

