import type { QRCodeObject } from "@/modules/qr-generator/cache";
import type { RGBWithMeta } from "@/modules/qr-generator/types";

export function buildBaseMatrix(
  qr: QRCodeObject,
  scaledSize: number,
  scale: number,
): { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } {
  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      matrix[y][x] = qr.isDark(moduleRow, moduleCol);
      colors[y][x] = null;
    }
  }

  return { matrix, colors };
}
