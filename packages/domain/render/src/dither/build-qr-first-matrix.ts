import type { QRCodeObject } from "@/domain/render/qr-generator-shared";

export function buildQRFirstMatrix(qr: QRCodeObject, moduleCount: number): boolean[][] {
  const result: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      result[row][col] = qr.isDark(row, col);
    }
  }
  return result;
}
