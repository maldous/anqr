import type { ColorMode } from '../../../modules/dither-algorithms/types';
import { clamp01, rgbToGray } from '../../../modules/dither-algorithms/utils';
import type { QuantizedPixelResult } from './quantized-pixel-result';

export function quantizeErrorDiffusionPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number
): QuantizedPixelResult {
  if (colorMode === 'bw') {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const newVal = gray > 0.5 ? 1 : 0;
    const error = (gray - newVal) * strengthFactor;
    return {
      isDark: newVal === 0,
      color: { r: newVal * 255, g: newVal * 255, b: newVal * 255 },
      errorR: error,
      errorG: error,
      errorB: error,
    };
  } else if (colorMode === 'grayscale') {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const newVal = Math.round(gray / step) * step;
    const error = (gray - newVal) * strengthFactor;
    const grayByte = Math.round(clamp01(newVal) * 255);
    return {
      isDark: newVal < 0.5,
      color: { r: grayByte, g: grayByte, b: grayByte },
      errorR: error,
      errorG: error,
      errorB: error,
    };
  }
  const newR = Math.round(pixel.r / step) * step;
  const newG = Math.round(pixel.g / step) * step;
  const newB = Math.round(pixel.b / step) * step;
  return {
    isDark: rgbToGray(newR, newG, newB) < 0.5,
    color: {
      r: Math.round(clamp01(newR) * 255),
      g: Math.round(clamp01(newG) * 255),
      b: Math.round(clamp01(newB) * 255),
    },
    errorR: (pixel.r - newR) * strengthFactor,
    errorG: (pixel.g - newG) * strengthFactor,
    errorB: (pixel.b - newB) * strengthFactor,
  };
}
