import { clamp01 } from "@/modules/dither-algorithms/utils";
import type { DiffusionPixelResult } from "./diffusion-pixel-result";

export function quantizeDiffusionStepPixel(params: {
  brightnessOf: (r: number, g: number, b: number) => number;
  channelMap?: (value: number) => number;
  errorScale: number;
  pixel: { r: number; g: number; b: number };
  step: number;
}): DiffusionPixelResult {
  const map = params.channelMap ?? ((value: number) => value);
  const newR = Math.round(params.pixel.r / params.step) * params.step;
  const newG = Math.round(params.pixel.g / params.step) * params.step;
  const newB = Math.round(params.pixel.b / params.step) * params.step;
  return {
    isDark: params.brightnessOf(newR, newG, newB) < 0.5,
    color: {
      r: Math.round(clamp01(map(newR)) * 255),
      g: Math.round(clamp01(map(newG)) * 255),
      b: Math.round(clamp01(map(newB)) * 255),
    },
    errorR: (params.pixel.r - newR) * params.errorScale,
    errorG: (params.pixel.g - newG) * params.errorScale,
    errorB: (params.pixel.b - newB) * params.errorScale,
  };
}
