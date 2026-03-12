export function copyImageToPixels(
  imageData: Float32Array[],
  width: number,
  height: number
): { r: number; g: number; b: number }[][] {
  const pixels: { r: number; g: number; b: number }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      row.push({
        r: imageData[y][idx],
        g: imageData[y][idx + 1],
        b: imageData[y][idx + 2],
      });
    }
    pixels.push(row);
  }
  return pixels;
}
