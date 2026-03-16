import type { PixelDecisionMatrix, RGBWithMeta } from "./types";

export function createEmptyMatrix(
  size: number,
  scale: number,
  effectiveIntensity: number,
): PixelDecisionMatrix {
  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    colors[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y][x] = false;
      colors[y][x] = null;
    }
  }
  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}
