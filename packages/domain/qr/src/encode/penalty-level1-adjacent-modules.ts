import type { QRCodeInstance } from "../qr-encoder/types";
import { countSameNeighbors } from "./count-same-neighbors";

// LEVEL1: Same color in a row/column (5+ consecutive)
export function penaltyLevel1AdjacentModules(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      const sameCount = countSameNeighbors(qrcode, row, col, moduleCount);

      if (sameCount > 5) {
        penalty += 3 + sameCount - 5;
      }
    }
  }
  return penalty;
}
