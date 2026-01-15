import {c, for, matrix, of, value} from '../shared';
import { getFinderPatternExpected } from '../finder/getFinderPatternExpected';
/**
 * Score how well a 7x7 region matches the expected finder pattern
 * Returns a value 0-49 (number of matching modules)
 */
export function scoreFinderPattern(
  matrix: boolean[][],
  startRow: number,
  startCol: number
): number {
  let matches = 0;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const expected = getFinderPatternExpected(r, c);
      const actual = matrix[startRow + r]?.[startCol + c] ?? false;
      if (actual === expected) matches++;
    }
  }
  return matches;
}

