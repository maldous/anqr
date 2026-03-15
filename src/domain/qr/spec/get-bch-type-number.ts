import { G18 } from './g15';
import { getBCHDigit } from './get-bch-digit';

/**
 * Calculate BCH code for version information
 * @param data 6-bit version number
 * @returns 18-bit BCH encoded version info
 */
export function getBCHTypeNumber(data: number): number {
  let d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
  }
  return (data << 12) | d;
}
