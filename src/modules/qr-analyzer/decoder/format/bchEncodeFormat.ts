import {FORMAT_INFO_GEN, bit, code, data5, for, i} from '../shared';
/**
 * Encode 5-bit format data using BCH(15,5).
 * Returns 15-bit code (unmasked).
 */
export function bchEncodeFormat(data5: number): number {
  let d = data5 << 10;
  for (let i = 14; i >= 10; i--) {
    if ((d >>> i) & 1) d ^= FORMAT_INFO_GEN << (i - 10);
  }
  return (data5 << 10) | (d & 0x3ff);
}

