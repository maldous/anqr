import { COLOR_PRESENT_FLAG } from './overlay-data-packed._internal';

export function packOverlayColor(r: number, g: number, b: number): number {
  return COLOR_PRESENT_FLAG | (r << 16) | (g << 8) | b;
}
