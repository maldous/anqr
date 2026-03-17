import { clamp } from "../primitives/clamp";
import { accumulateKernelRgb } from "./accumulate-kernel-rgb";
import { clampImageCoordinate } from "./clamp-image-coordinate";
import { edgePixelIndex } from "./edge-pixel-index";

// ============================================
// CONVOLUTION FILTERS
// ============================================

export function convolve(imageData: ImageData, kernel: number[][], divisor?: number): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new Uint8ClampedArray(data);

  const kSize = kernel.length;
  const kHalf = Math.floor(kSize / 2);
  const div = divisor ?? (kernel.flat().reduce((a, b) => a + b, 0) || 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const accum = { r: 0, g: 0, b: 0 };

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = clampImageCoordinate(x + kx - kHalf, width - 1);
          const py = clampImageCoordinate(y + ky - kHalf, height - 1);
          const weight = kernel[ky][kx];
          accumulateKernelRgb(data, width, px, py, weight, accum);
        }
      }

      const idx = edgePixelIndex(width, x, y);
      result[idx] = clamp(accum.r / div);
      result[idx + 1] = clamp(accum.g / div);
      result[idx + 2] = clamp(accum.b / div);
    }
  }

  imageData.data.set(result);
  return imageData;
}
