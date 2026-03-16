export function copyImageToPixels(
  imageData: Float32Array[],
  width: number,
  height: number,
  transform?: (r: number, g: number, b: number) => { r: number; g: number; b: number },
): { r: number; g: number; b: number }[][] {
  const pixels: { r: number; g: number; b: number }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      row.push(transform ? transform(r, g, b) : { r, g, b });
    }
    pixels.push(row);
  }
  return pixels;
}
