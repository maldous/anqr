import type { RSBasisVector } from './rs-basis.types';

/**
 * Convert a basis to a binary matrix for Gauss-Jordan elimination
 * Rows are vectors, columns are bit positions
 *
 * @param vectors Basis vectors (from same RS block)
 * @param totalBits Total bits in a block (data + ECC)
 * @returns Binary matrix as 2D array of booleans
 */
export function basisToMatrix(vectors: RSBasisVector[], totalBits: number): boolean[][] {
  const matrix: boolean[][] = [];

  for (const v of vectors) {
    const row: boolean[] = [];
    for (let byteIdx = 0; byteIdx < v.blockBits.length; byteIdx++) {
      for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
        row.push((v.blockBits[byteIdx] & (1 << bitIdx)) !== 0);
      }
    }
    // Pad or truncate to totalBits
    while (row.length < totalBits) row.push(false);
    matrix.push(row.slice(0, totalBits));
  }

  return matrix;
}
