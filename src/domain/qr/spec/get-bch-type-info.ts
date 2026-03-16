import { G15, G15_MASK } from "./g15";
import { getBCHDigit } from "./get-bch-digit";

/**
 * Calculate BCH code for format information
 * Format info = (ECC level << 3) | mask pattern
 * @param data 5-bit format data
 * @returns 15-bit BCH encoded format info (XORed with mask)
 */
export function getBCHTypeInfo(data: number): number {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
}
