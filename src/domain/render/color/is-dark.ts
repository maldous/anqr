import type { RGB } from '../../../modules/core/types';
import { parseColor } from './parse-color';
import { BLACK } from './color._internal';
import { rgbToGray } from './rgb-to-gray';

/** Check if a color is considered "dark" */
export function isDark(color: RGB | string): boolean {
  const c = typeof color === 'string' ? (parseColor(color) ?? BLACK) : color;
  const gray = rgbToGray(c.r, c.g, c.b);
  return gray < 128;
}
