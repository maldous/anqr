import type { QRCodeInstance } from "../../../modules/qr-encoder/types";

/**
 * Count how many of the 8 neighbors around (row, col) share the same dark/light value.
 */
export function countSameNeighbors(
  qrcode: QRCodeInstance,
  row: number,
  col: number,
  moduleCount: number,
): number {
  let sameCount = 0;
  const dark = qrcode.isDark(row, col);

  for (let r = -1; r <= 1; r += 1) {
    if (row + r < 0 || moduleCount <= row + r) continue;

    for (let c = -1; c <= 1; c += 1) {
      if (col + c < 0 || moduleCount <= col + c) continue;
      if (r === 0 && c === 0) continue;

      if (dark === qrcode.isDark(row + r, col + c)) {
        sameCount += 1;
      }
    }
  }

  return sameCount;
}
