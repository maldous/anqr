import {bit, bits, bottom, col, for, i, left, location, matrix, right, row, top} from '../shared';
/**
 * Read 15-bit format info from secondary location (near bottom-left and top-right finders)
 */
export function readFormatInfoFromSecondary(matrix: boolean[][]): number | null {
  const moduleCount = matrix.length;
  let bits = 0;
  
  // Bits 0-7 from row 8, columns (moduleCount-1) down to (moduleCount-8)
  for (let i = 0; i < 8; i++) {
    const col = moduleCount - 1 - i;
    if (matrix[8]?.[col]) {
      bits |= (1 << i);
    }
  }
  
  // Bits 8-14 from column 8, rows (moduleCount-7) up to (moduleCount-1)
  for (let i = 0; i < 7; i++) {
    const row = moduleCount - 7 + i;
    if (matrix[row]?.[8]) {
      bits |= (1 << (8 + i));
    }
  }
  
  return bits;
}

