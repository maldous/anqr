import { rgbToGray } from '../color/color';
import { edgePixelIndex } from './edge-pixel-index';
import { SOBEL_X, SOBEL_Y } from './sobel-kernels.const';

// ============================================
// EDGE DETECTION
// ============================================

export function sobelEdge(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = edgePixelIndex(width, x + kx, y + ky);
          const gray = rgbToGray(data[idx], data[idx + 1], data[idx + 2]);
          gx += gray * SOBEL_X[ky + 1][kx + 1];
          gy += gray * SOBEL_Y[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.min(255, Math.hypot(gx, gy));
      const idx = edgePixelIndex(width, x, y);
      result[idx] = magnitude;
      result[idx + 1] = magnitude;
      result[idx + 2] = magnitude;
      result[idx + 3] = data[idx + 3];
    }
  }

  imageData.data.set(result);
  return imageData;
}
