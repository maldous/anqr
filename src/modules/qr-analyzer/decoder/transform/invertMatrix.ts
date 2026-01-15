import {matrix, row, v} from '../shared';
/**
 * Invert a boolean matrix (swap true/false)
 */
export function invertMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map(row => row.map(v => !v));
}

