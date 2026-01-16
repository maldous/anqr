/**
 * QR Generator Filters - Blur
 * Box blur filter implementation
 */

/**
 * Apply box blur
 */
export function applyBoxBlur(imageData, radius) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);
  const size = radius * 2 + 1;
  const divisor = size * size;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          r += copy[idx];
          g += copy[idx + 1];
          b += copy[idx + 2];
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx] = Math.round(r / divisor);
      data[outIdx + 1] = Math.round(g / divisor);
      data[outIdx + 2] = Math.round(b / divisor);
    }
  }
}
