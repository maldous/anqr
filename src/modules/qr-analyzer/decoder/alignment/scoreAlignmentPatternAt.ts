import {c, for, matrix, of, value} from '../shared';
import { getAlignmentPatternExpected } from '../alignment/getAlignmentPatternExpected';
/**
 * Score how well a 5x5 region matches the expected alignment pattern
 * Returns a value 0-25 (number of matching modules)
 */
export function scoreAlignmentPatternAt(
  matrix: boolean[][],
  centerRow: number,
  centerCol: number
): number {
  let matches = 0;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const expected = getAlignmentPatternExpected(r + 2, c + 2);
      const actual = matrix[centerRow + r]?.[centerCol + c] ?? false;
      if (actual === expected) matches++;
    }
  }
  return matches;
}

