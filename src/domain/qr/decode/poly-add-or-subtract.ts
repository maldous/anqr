import { gfAdd } from './gf-add';
import { polyIsZero } from './poly-is-zero';
import { polyTrimLeadingZeros } from './poly-trim-leading-zeros';

/**
 * Add/subtract two polynomials (same in GF(2^m))
 * Both in high-to-low convention
 */
export function polyAddOrSubtract(p1: number[], p2: number[]): number[] {
  if (polyIsZero(p1)) return [...p2];
  if (polyIsZero(p2)) return [...p1];

  // Smaller degree goes first
  const smaller = p1.length < p2.length ? p1 : p2;
  const larger = p1.length < p2.length ? p2 : p1;

  const result = [...larger];
  const offset = larger.length - smaller.length;
  for (let i = 0; i < smaller.length; i++) {
    result[offset + i] = gfAdd(result[offset + i], smaller[i]);
  }

  // Remove leading zeros
  return polyTrimLeadingZeros(result);
}
