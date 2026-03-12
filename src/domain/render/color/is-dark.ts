import { parseColor } from './parse-color';
import { rgbToGray } from './rgb-to-gray';
import type { RGB } from '../../../modules/core/types';

export function isDark(color: string | RGB): boolean {
  const parsed = typeof color === 'string' ? parseColor(color) : color;
  if (!parsed) return false;
  return rgbToGray(parsed.r, parsed.g, parsed.b) <= 128;
}
