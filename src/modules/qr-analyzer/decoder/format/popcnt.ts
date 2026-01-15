import {POPCNT16, bit, bits, distance, for, x} from '../shared';
/**
 * Decode format info bits to extract ECC level and mask pattern
 */
/**
 * Popcount for 32-bit integers (used for BCH distance)
 */
export function popcnt(x: number): number {
  // Most callers here use <= 15 bits, but keep generic 32-bit support.
  return POPCNT16[x & 0xffff] + POPCNT16[(x >>> 16) & 0xffff];
}

