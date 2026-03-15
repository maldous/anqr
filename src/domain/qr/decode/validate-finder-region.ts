import { compareFinderModule } from './compare-finder-module';

export function validateFinderRegion(
  matrix: boolean[][],
  finderPattern: number[][],
  rowOffset: number,
  colOffset: number
): { matches: number; mismatches: number; errors: string[] } {
  let matches = 0;
  let mismatches = 0;
  const errors: string[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      if (compareFinderModule(matrix, finderPattern, row, col, rowOffset, colOffset, errors)) {
        matches++;
      } else {
        mismatches++;
      }
    }
  }
  return { matches, mismatches, errors };
}
