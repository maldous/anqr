import {bit, col, dark, for, matrix, row, transform, x, y} from '../shared';
/**
 * Read 15-bit format info directly from the *image* using the current transform.
 * This is used for sub-module refinement without building a full matrix.
 * If `inverted` is true, sampled dark/light is flipped (handles polarity inversions).
 */
export function readFormatInfoFromTopLeftImage(
  data: Uint8ClampedArray,
  luma: Uint8Array | null,
  width: number,
  height: number,
  transform: (col: number, row: number) => { x: number; y: number }

