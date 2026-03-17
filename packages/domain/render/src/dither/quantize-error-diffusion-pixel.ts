import type { ColorMode } from "@/modules/dither-algorithms/types";
import { rgbToGray } from "@/modules/dither-algorithms/utils";
import type { QuantizedPixelResult } from "./quantized-pixel-result";
import { quantizeDiffusionStepPixel } from "./quantize-diffusion-step-pixel";
import { quantizeDiffusionThresholdPixel } from "./quantize-diffusion-threshold-pixel";

export function quantizeErrorDiffusionPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
): QuantizedPixelResult {
  if (colorMode === "bw") {
    return quantizeDiffusionThresholdPixel({
      errorScale: strengthFactor,
      gray: rgbToGray(pixel.r, pixel.g, pixel.b),
      outByte: (value) => value * 255,
      threshold: 0.5,
    });
  } else if (colorMode === "grayscale") {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const newVal = Math.round(gray / step) * step;
    return {
      isDark: newVal < 0.5,
      color: {
        r: Math.round(newVal * 255),
        g: Math.round(newVal * 255),
        b: Math.round(newVal * 255),
      },
      errorR: (gray - newVal) * strengthFactor,
      errorG: (gray - newVal) * strengthFactor,
      errorB: (gray - newVal) * strengthFactor,
    };
  }
  return quantizeDiffusionStepPixel({
    brightnessOf: rgbToGray,
    errorScale: strengthFactor,
    pixel,
    step,
  });
}
