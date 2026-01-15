import {col, row, transform, x, y} from '../shared';

export function sampleModuleWithVoting(
  data: Uint8ClampedArray,
  luma: Uint8Array | null,
  width: number,
  height: number,
  transform: (col: number, row: number) => { x: number; y: number }

