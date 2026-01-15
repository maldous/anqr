import {c, col, for, matrix, of, row, total, v} from '../shared';
/**
 * Score timing pattern alternation (row 6 and column 6)
 * Returns ratio 0.0-1.0 of correctly alternating modules
 */
export function scoreTimingPattern(matrix: boolean[][], moduleCount: number): number {
  let correctPhase0 = 0;
  let correctPhase1 = 0;
  let total = 0;

  // Horizontal timing (row 6, cols 8 to moduleCount-9)
  for (let c = 8; c < moduleCount - 8; c++) {
    const v = matrix[6]?.[c] ?? false;
    const exp0 = (c % 2) === 0;
    if (v === exp0) correctPhase0++;
    if (v !== exp0) correctPhase1++; // inverted phase
    total++;
  }

  // Vertical timing (col 6, rows 8 to moduleCount-9)
  for (let r = 8; r < moduleCount - 8; r++) {
    const v = matrix[r]?.[6] ?? false;
    const exp0 = (r % 2) === 0;
    if (v === exp0) correctPhase0++;
    if (v !== exp0) correctPhase1++;
    total++;
  }

  if (total <= 0) return 0;
  return Math.max(correctPhase0, correctPhase1) / total;
}

