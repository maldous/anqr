import type { QRCodeInstance } from "../../../modules/qr-encoder/types";

// LEVEL4: Dark/light ratio deviation from 50%
export function penaltyLevel4Ratio(qrcode: QRCodeInstance, moduleCount: number): number {
  let darkCount = 0;
  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount; row += 1) {
      if (qrcode.isDark(row, col)) {
        darkCount += 1;
      }
    }
  }

  const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
  return ratio * 10;
}
