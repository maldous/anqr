import {for, i, idx, imageData, of, step} from '../shared';
import { lumaAt } from '../luma/lumaAt';
/**
 * Calculate average brightness of an image for adaptive thresholding
 */
export function calculateAverageBrightness(imageData: ImageData, luma?: Uint8Array): number {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  // Sample every 4th pixel for speed on large images
  const step = pixelCount > 100000 ? 4 : 1;
  let sampledCount = 0;
  let totalBrightness = 0;

  if (luma) {
    for (let i = 0; i < pixelCount; i += step) {
      totalBrightness += luma[i];
      sampledCount++;
    }
  } else {
    for (let i = 0; i < pixelCount; i += step) {
      const idx = i * 4;
      totalBrightness += lumaAt(data, idx);
      sampledCount++;
    }
  }

  if (sampledCount === 0) return 128;
  return totalBrightness / sampledCount;
}

