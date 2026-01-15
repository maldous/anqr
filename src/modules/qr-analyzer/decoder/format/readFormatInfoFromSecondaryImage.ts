import {bit, col, location, row, transform, x, y} from '../shared';
/**
 * Read 15-bit format info from the secondary location directly from the image.
 */
export function readFormatInfoFromSecondaryImage(
  data: Uint8ClampedArray,
  luma: Uint8Array | null,
  width: number,
  height: number,
  transform: (col: number, row: number) => { x: number; y: number }

