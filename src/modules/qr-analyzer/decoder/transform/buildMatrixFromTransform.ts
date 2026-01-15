import {col, matrix, row, threshold, transform, x, y} from '../shared';
/**
 * Build a matrix from image data using given transform and threshold
 */
export function buildMatrixFromTransform(
  data: Uint8ClampedArray,
  luma: Uint8Array | null,
  width: number,
  height: number,
  transform: (col: number, row: number) => { x: number; y: number }

