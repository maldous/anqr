import type { RGBWithMeta } from './types';
import { unpackColor } from './unpack-color';

export function packedColorsToMatrix(colors: Uint32Array, size: number): (RGBWithMeta | null)[][] {
  const matrix: (RGBWithMeta | null)[][] = new Array(size);
  for (let y = 0; y < size; y++) {
    const row: (RGBWithMeta | null)[] = new Array(size);
    const base = y * size;
    for (let x = 0; x < size; x++) {
      row[x] = unpackColor(colors[base + x]);
    }
    matrix[y] = row;
  }
  return matrix;
}
