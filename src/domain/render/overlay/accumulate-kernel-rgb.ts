import { edgePixelIndex } from './edge-pixel-index';

export function accumulateKernelRgb(
  data: Uint8ClampedArray,
  width: number,
  px: number,
  py: number,
  weight: number,
  accum: { r: number; g: number; b: number }
): void {
  const idx = edgePixelIndex(width, px, py);
  accum.r += data[idx] * weight;
  accum.g += data[idx + 1] * weight;
  accum.b += data[idx + 2] * weight;
}
