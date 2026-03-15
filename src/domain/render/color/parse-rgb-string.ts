import type { RGBA } from '../../../modules/core/types';

/** Parse rgb() or rgba() string */
export function parseRgbString(str: string): RGBA {
  const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
  const match = rgbRegex.exec(str);
  if (match) {
    return {
      r: Number.parseInt(match[1], 10),
      g: Number.parseInt(match[2], 10),
      b: Number.parseInt(match[3], 10),
      a: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}
