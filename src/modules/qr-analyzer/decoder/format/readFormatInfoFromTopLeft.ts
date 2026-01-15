import {bit, bits, for, i, left, matrix, row, top} from '../shared';
/**
 * Read 15-bit format info from around top-left finder pattern
 */
export function readFormatInfoFromTopLeft(matrix: boolean[][]): number | null {
  let bits = 0;
  
  // Read from column 8, rows 0-5 (bits 0-5)
  for (let i = 0; i < 6; i++) {
    if (matrix[i]?.[8]) {
      bits |= (1 << i);
    }
  }
  
  // Skip row 6 (timing pattern), read rows 7-8 (bits 6-7)
  if (matrix[7]?.[8]) bits |= (1 << 6);
  if (matrix[8]?.[8]) bits |= (1 << 7);
  
  // Read from row 8, columns 7, 5, 4, 3, 2, 1, 0 (bits 8-14)
  // Bit 8 is at column 7
  if (matrix[8]?.[7]) bits |= (1 << 8);
  
  // Bits 9-14 are at columns 5, 4, 3, 2, 1, 0
  for (let i = 0; i < 6; i++) {
    if (matrix[8]?.[5 - i]) {
      bits |= (1 << (9 + i));
    }
  }
  
  return bits;
}

