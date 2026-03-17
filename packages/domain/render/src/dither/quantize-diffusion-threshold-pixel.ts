import type { DiffusionPixelResult } from "./diffusion-pixel-result";

export function quantizeDiffusionThresholdPixel(params: {
  errorScale: number;
  gray: number;
  outByte: (value: number) => number;
  threshold: number;
}): DiffusionPixelResult {
  const newVal = params.gray > params.threshold ? 1 : 0;
  const error = (params.gray - newVal) * params.errorScale;
  const outVal = params.outByte(newVal);
  return {
    isDark: newVal === 0,
    color: { r: outVal, g: outVal, b: outVal },
    errorR: error,
    errorG: error,
    errorB: error,
  };
}
