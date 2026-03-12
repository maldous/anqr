export function countFinalMatchingPixels(
  finalMatrix: boolean[][],
  targets: boolean[][],
  dataPixels: Set<number>,
  moduleCount: number
): number {
  let matching = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const pixelIdx = row * moduleCount + col;
      if (!dataPixels.has(pixelIdx)) continue;
      const finalValue = finalMatrix[row]?.[col] ?? false;
      const targetValue = targets[row]?.[col] ?? false;
      if (finalValue === targetValue) {
        matching++;
      }
    }
  }
  return matching;
}
