import { COLOR_PACKED_FLAG } from './color-packed-flag';

export function packColor(r: number, g: number, b: number): number {
  return COLOR_PACKED_FLAG | (r << 16) | (g << 8) | b;
}
