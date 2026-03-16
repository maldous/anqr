import type { QRCodeInstance } from "../../../modules/qr-generator/types";

export function isRunLengthCellMatch(
  qr: QRCodeInstance,
  ditherPattern: boolean[][] | null,
  skipMask: Uint8Array,
  rowBase: number,
  row: number,
  col: number,
  moduleCount: number,
  isDarkPass: boolean,
): boolean {
  if (col >= moduleCount || skipMask[rowBase + col]) return false;
  const cellIsDark = ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col);
  return isDarkPass ? cellIsDark : !cellIsDark;
}
