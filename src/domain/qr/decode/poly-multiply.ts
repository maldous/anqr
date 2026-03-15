import { gfAdd } from './gf-add';
import { gfMul } from './gf-mul';
import { polyIsZero } from './poly-is-zero';

/**
 * Multiply two polynomials (high-to-low convention)
 */
export function polyMultiply(p1: number[], p2: number[]): number[] {
  if (polyIsZero(p1) || polyIsZero(p2)) return [0];

  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] = gfAdd(result[i + j], gfMul(p1[i], p2[j]));
    }
  }
  return result;
}
