/**
 * QR Generator Blur Filters
 * Box blur implementation for image processing
 */

/**
 * Apply box blur to image data
 */
export function applyBoxBlur(
  imageData: ImageData,
  radius: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);

  const size = radius * 2 + 1;
  const area = size * size;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sx = Math.min(Math.max(x + dx, 0), width - 1);
          const sy = Math.min(Math.max(y + dy, 0), height - 1);
          const idx = (sy * width + sx) * 4;

          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
        }
      }

      const idx = (y * width + x) * 4;
      output[idx] = r / area;
      output[idx + 1] = g / area;
      output[idx + 2] = b / area;
      output[idx + 3] = a / area;
    }
  }

  return new ImageData(output, width, height);
}
