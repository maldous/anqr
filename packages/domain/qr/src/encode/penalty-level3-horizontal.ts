import type { QRCodeInstance } from "../qr-encoder/types";

export function penaltyLevel3Horizontal(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount - 6; col += 1) {
      if (
        qrcode.isDark(row, col) &&
        !qrcode.isDark(row, col + 1) &&
        qrcode.isDark(row, col + 2) &&
        qrcode.isDark(row, col + 3) &&
        qrcode.isDark(row, col + 4) &&
        !qrcode.isDark(row, col + 5) &&
        qrcode.isDark(row, col + 6)
      ) {
        penalty += 40;
      }
    }
  }
  return penalty;
}
