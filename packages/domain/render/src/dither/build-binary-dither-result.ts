import type { DitherResult, RGB } from "@/modules/dither-algorithms/types";
import { rgbToGray } from "@/modules/dither-algorithms/utils";

export function buildBinaryDitherResult(params: {
  height: number;
  imageData: Float32Array[];
  resolveThreshold: (x: number, y: number) => number;
  strengthFactor?: number;
  width: number;
}): DitherResult {
  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];
  const strengthFactor = params.strengthFactor ?? 1;

  for (let y = 0; y < params.height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < params.width; x++) {
      const idx = x * 3;
      const r = params.imageData[y][idx];
      const g = params.imageData[y][idx + 1];
      const b = params.imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);
      const threshold = params.resolveThreshold(x, y);
      const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
      const isDark = gray < adjustedThreshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
