import {dark, for, i, matrix, patterns, row, total} from '../shared';
/**
 * Check if timing patterns exist
 */
export function checkTimingPattern(matrix: boolean[][]): boolean {
  const moduleCount = matrix.length;
  if (moduleCount < 21) return false;

  // Timing pattern is at row 6 and column 6, alternating dark/light
  let matches = 0;
  let total = 0;

  for (let i = 8; i < moduleCount - 8; i++) {
    // Horizontal timing (row 6)
    const expectedH = (i % 2) === 0;
    if (matrix[6]?.[i] === expectedH) matches++;
    total++;

    // Vertical timing (column 6)
    const expectedV = (i % 2) === 0;
    if (matrix[i]?.[6] === expectedV) matches++;
    total++;
  }

  // Consider timing patterns present if >70% match expected pattern
  return total > 0 && (matches / total) > 0.7;
}

