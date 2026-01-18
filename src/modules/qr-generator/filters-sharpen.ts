/**
 * QR Generator Sharpen Filters
 * Sharpening implementation for image processing
 */

/**
 * Apply sharpening to image data using unsharp mask
 */
export function applySharpen(
  imageData: ImageData,
  amount: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);

  // Sharpen kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const sx = Math.min(Math.max(x + kx, 0), width - 1);
          const sy = Math.min(Math.max(y + ky, 0), height - 1);
          const idx = (sy * width + sx) * 4;
          const weight = kernel[(ky + 1) * 3 + (kx + 1)];

          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }

      const idx = (y * width + x) * 4;
      const origIdx = idx;

      // Blend original and sharpened based on amount
      output[idx] = Math.max(0, Math.min(255, data[origIdx] + (r - data[origIdx]) * amount));
      output[idx + 1] = Math.max(0, Math.min(255, data[origIdx + 1] + (g - data[origIdx + 1]) * amount));
      output[idx + 2] = Math.max(0, Math.min(255, data[origIdx + 2] + (b - data[origIdx + 2]) * amount));
      output[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(output, width, height);
}
