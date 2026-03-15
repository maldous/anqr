import type { ColorMode } from '../../../modules/dither-algorithms/types';
import { rgbToGray } from '../../../modules/dither-algorithms/utils';
import type { DiffusionPixelResult } from './diffusion-pixel-result';
import { quantizeDiffusionStepPixel } from './quantize-diffusion-step-pixel';
import { quantizeDiffusionThresholdPixel } from './quantize-diffusion-threshold-pixel';

export function quantizeEdgeAwarePixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
  edgeFactor: number
): DiffusionPixelResult {
  if (colorMode === 'bw') {
    return quantizeDiffusionThresholdPixel({
      errorScale: strengthFactor * edgeFactor,
      gray: rgbToGray(pixel.r, pixel.g, pixel.b),
      outByte: (value) => value * 255,
      threshold: 0.5,
    });
  }
  return quantizeDiffusionStepPixel({
    brightnessOf: rgbToGray,
    errorScale: strengthFactor * edgeFactor,
    pixel,
    step,
  });
}
