import type { ColorMode } from '../../../modules/dither-algorithms/types';
import { clamp01 } from '../../../modules/dither-algorithms/utils';
import type { DiffusionPixelResult } from './diffusion-pixel-result';

export function quantizePerceptualPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
  toSRGB: (v: number) => number
): DiffusionPixelResult {
  if (colorMode === 'bw') {
    const gray = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
    const newVal = gray > 0.5 ? 1 : 0;
    const error = (gray - newVal) * strengthFactor;
    const outVal = Math.round(toSRGB(newVal) * 255);
    return {
      isDark: newVal === 0,
      color: { r: outVal, g: outVal, b: outVal },
      errorR: error,
      errorG: error,
      errorB: error,
    };
  }
  const newR = Math.round(pixel.r / step) * step;
  const newG = Math.round(pixel.g / step) * step;
  const newB = Math.round(pixel.b / step) * step;
  return {
    isDark: newR * 0.2126 + newG * 0.7152 + newB * 0.0722 < 0.5,
    color: {
      r: Math.round(clamp01(toSRGB(newR)) * 255),
      g: Math.round(clamp01(toSRGB(newG)) * 255),
      b: Math.round(clamp01(toSRGB(newB)) * 255),
    },
    errorR: (pixel.r - newR) * strengthFactor,
    errorG: (pixel.g - newG) * strengthFactor,
    errorB: (pixel.b - newB) * strengthFactor,
  };
}
