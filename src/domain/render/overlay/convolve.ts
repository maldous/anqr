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
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = Math.max(0, Math.min(width - 1, x + kx - kHalf));
          const py = Math.max(0, Math.min(height - 1, y + ky - kHalf));
          const idx = (py * width + px) * 4;
          const weight = kernel[ky][kx];

          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }

      const idx = (y * width + x) * 4;
      result[idx] = Math.max(0, Math.min(255, Math.round(r / div)));
      result[idx + 1] = Math.max(0, Math.min(255, Math.round(g / div)));
      result[idx + 2] = Math.max(0, Math.min(255, Math.round(b / div)));
    }
  }

  imageData.data.set(result);
  return imageData;
}
