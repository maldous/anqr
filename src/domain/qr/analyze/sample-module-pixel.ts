import { grayAt } from './decoder-color-utils';

export function sampleModulePixel(
  data: Uint8ClampedArray,
  width: number,
  imgWidth: number,
  imgHeight: number,
  x: number,
  y: number
): { isDark: boolean; dark: number; light: number; oob: number } {
  if (x >= 0 && x < imgWidth && y >= 0 && y < imgHeight) {
    const idx = (y * width + x) * 4;
    const gray = grayAt(data, idx);
    const isDark = gray < 128;
    return { isDark, dark: isDark ? 1 : 0, light: isDark ? 0 : 1, oob: 0 };
  }

  return { isDark: false, dark: 0, light: 0, oob: 1 };
}
