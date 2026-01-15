import {col, dx, dy, row, transform, x, y} from '../shared';
/**
 * Create an offset transform that shifts the sampling grid by (dx, dy) modules
 */
export function createOffsetTransform(
  baseTransform: (col: number, row: number) => { x: number; y: number }

