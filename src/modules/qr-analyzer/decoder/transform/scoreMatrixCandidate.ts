import {agree, best, candidate, candidates, distance, for, matrix, patterns, scale, score, total} from '../shared';
import { readFormatInfoDetailed } from '../format/readFormatInfoDetailed';
import { scoreFinderPattern } from '../finder/scoreFinderPattern';
import { scoreTimingPattern } from '../timing/scoreTimingPattern';
/**
 * Comprehensive scoring function for matrix candidates
 * Higher score = better candidate
 * 
 * Components:
 * - Full finder pattern match (3 patterns × 49 modules = 147 max)
 * - Timing pattern ratio (scaled to 0-50)
 * - Format info decodability bonus (0 or 50)
 */
export function scoreMatrixCandidate(matrix: boolean[][], moduleCount: number): number {
  if (!matrix || matrix.length !== moduleCount) return 0;

  // Score all three finder patterns (max 49 each = 147 total)
  const tlScore = scoreFinderPattern(matrix, 0, 0);
  const trScore = scoreFinderPattern(matrix, 0, moduleCount - 7);
  const blScore = scoreFinderPattern(matrix, moduleCount - 7, 0);
  const finderScore = tlScore + trScore + blScore;

  // Score timing pattern (scale to 0-50)
  const timingRatio = scoreTimingPattern(matrix, moduleCount);
  const timingScore = timingRatio * 50;

  // Format info BCH decodability + agreement bonus (strong signal for correct sampling)
  let formatBonus = 0;
  try {
    const f = readFormatInfoDetailed(matrix);

    if (f.best) {
      if (f.agree) {
        // Strong bonus when both format reads correct to the same ECC/mask.
        // Prefer low total distance (0 is ideal).
        formatBonus = Math.max(0, 90 - 12 * f.totalDist);
      } else {
        // We can still be correct, but sampling is suspicious.
        // Prefer lower bestDist.
        formatBonus = Math.max(0, 40 - 8 * f.bestDist);
      }
    } else {
      formatBonus = 0;
    }
  } catch {
    formatBonus = 0;
  }

  return finderScore + timingScore + formatBonus;
}

