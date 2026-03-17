/**
 * Calculate average color from image data
 */
export function averageColor(imageData: ImageData): { r: number; g: number; b: number } {
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount),
  };
}
