/**
 * QR Generator Filters - Sharpen
 * Sharpen filter implementation
 */

/**
 * Apply sharpen filter
 */
export function applySharpen(imageData, amount) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  // Sharpen kernel: center = 1 + 4*amount, neighbors = -amount
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0,
        g = 0,
        b = 0;
      let ki = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[ki++];
          r += copy[idx] * k;
          g += copy[idx + 1] * k;
          b += copy[idx + 2] * k;
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx] = Math.max(0, Math.min(255, Math.round(r)));
      data[outIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[outIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }
}
