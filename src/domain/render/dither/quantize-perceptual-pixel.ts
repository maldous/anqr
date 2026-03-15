import type { ColorMode } from '../../../modules/dither-algorithms/types';
import type { DiffusionPixelResult } from './diffusion-pixel-result';
import { quantizeDiffusionStepPixel } from './quantize-diffusion-step-pixel';
import { quantizeDiffusionThresholdPixel } from './quantize-diffusion-threshold-pixel';

export function quantizePerceptualPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
  toSRGB: (v: number) => number
): DiffusionPixelResult {
  if (colorMode === 'bw') {
    return quantizeDiffusionThresholdPixel({
      errorScale: strengthFactor,
      gray: pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722,
      outByte: (value) => Math.round(toSRGB(value) * 255),
      threshold: 0.5,
    });
  }
  return quantizeDiffusionStepPixel({
    brightnessOf: (r, g, b) => r * 0.2126 + g * 0.7152 + b * 0.0722,
    channelMap: toSRGB,
    errorScale: strengthFactor,
    pixel,
    step,
  });
}
