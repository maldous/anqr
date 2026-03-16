import { QRMode } from "../../../modules/qr-encoder/types";
import { getLengthInBits } from "../encode/utils";
import { getNumericBitsForDigits } from "./get-numeric-bits-for-digits";

export function getMaxNumericDigitsForBits(availableBits: number, version: number): number {
  if (availableBits <= 0) return 0;
  const numCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
  let low = 0;
  let high = 10000;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const needed = 4 + numCharCountBits + getNumericBitsForDigits(mid);
    if (needed <= availableBits) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}
