/**
 * Load image data as RGB array
 */
export function loadImageDataRGB(imageData: ImageData): { r: number; g: number; b: number }[][] {
  const { width, height, data } = imageData;
  const result: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      result[y][x] = {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      };
    }
  }

  return result;
}
