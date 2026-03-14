export function mapImageToTargets(
  image: ImageData,
  moduleCount: number,
  threshold: number = 128
): { targets: boolean[][]; importance: number[][] } {
  const targets: boolean[][] = [];
  const importance: number[][] = [];
  const scaleX = image.width / moduleCount;
  const scaleY = image.height / moduleCount;

  for (let row = 0; row < moduleCount; row++) {
    targets[row] = [];
    importance[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      const imgX = Math.floor((col + 0.5) * scaleX);
      const imgY = Math.floor((row + 0.5) * scaleY);
      const idx = (imgY * image.width + imgX) * 4;
      const gray = (image.data[idx] + image.data[idx + 1] + image.data[idx + 2]) / 3;
      targets[row][col] = gray < threshold;
      importance[row][col] = Math.abs(gray - threshold) / 128;
    }
  }

  return { targets, importance };
}
