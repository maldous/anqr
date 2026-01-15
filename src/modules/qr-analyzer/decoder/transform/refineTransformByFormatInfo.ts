import {bit, col, distance, dx, dy, for, px, row, transform, x, y} from '../shared';
/**
 * Refine a transform by locally searching for the (dx,dy) offset that minimizes BCH distance
 * and maximizes agreement between the two format info reads.
 *
 * This is cheap (≈30 module reads per test) and tends to fix "almost correct" sampling where
 * RS fails due to systematic bit flips at low px/module.
 */
export function refineTransformByFormatInfo(
  data: Uint8ClampedArray,
  luma: Uint8Array | null,
  width: number,
  height: number,
  baseTransform: (col: number, row: number) => { x: number; y: number }

