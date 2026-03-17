import type { QRCodeInstance } from "@/modules/qr-encoder/types";

export function penaltyLevel3Vertical(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount - 6; row += 1) {
      if (
        qrcode.isDark(row, col) &&
        !qrcode.isDark(row + 1, col) &&
        qrcode.isDark(row + 2, col) &&
        qrcode.isDark(row + 3, col) &&
        qrcode.isDark(row + 4, col) &&
        !qrcode.isDark(row + 5, col) &&
        qrcode.isDark(row + 6, col)
      ) {
        penalty += 40;
      }
    }
  }
  return penalty;
}
