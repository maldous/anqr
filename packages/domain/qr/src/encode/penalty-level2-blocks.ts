import type { QRCodeInstance } from "../qr-encoder/types";
import { count2x2DarkModules } from "./count2x2-dark-modules";

// LEVEL2: 2x2 blocks of same color
export function penaltyLevel2Blocks(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let row = 0; row < moduleCount - 1; row += 1) {
    for (let col = 0; col < moduleCount - 1; col += 1) {
      const count = count2x2DarkModules(qrcode, row, col);
      if (count === 0 || count === 4) {
        penalty += 3;
      }
    }
  }
  return penalty;
}
