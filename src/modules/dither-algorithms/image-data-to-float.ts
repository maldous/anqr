/** Convert ImageData to float array format */
export function imageDataToFloat(imageData: ImageData): Float32Array[] {
  const { data, width, height } = imageData;
  const result: Float32Array[] = [];

  for (let y = 0; y < height; y++) {
    const row = new Float32Array(width * 3);
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = x * 3;
      row[dstIdx] = data[srcIdx] / 255;
      row[dstIdx + 1] = data[srcIdx + 1] / 255;
      row[dstIdx + 2] = data[srcIdx + 2] / 255;
    }
    result.push(row);
  }

  return result;
}
