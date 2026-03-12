import { parseColor } from './parse-color';
import { BLACK } from './color._internal';
import { getRelativeLuminance } from './get-relative-luminance';

/** Get best text color (black or white) for given background */
export function getTextColor(backgroundColor: string): string {
  const bg = parseColor(backgroundColor) ?? BLACK;
  const luminance = getRelativeLuminance(bg);
  return luminance > 0.179 ? '#000000' : '#ffffff';
}
