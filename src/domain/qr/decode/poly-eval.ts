import { gfAdd } from './gf-add';
import { gfMul } from './gf-mul';

/**
 * Evaluate polynomial at x (high-to-low convention)
 * Uses Horner's method
 */
export function polyEval(poly: number[], x: number): number {
  if (poly.length === 0) return 0;
  if (x === 0) {
    // Return constant term (last coefficient in high-to-low)
    return poly[poly.length - 1];
  }
  // Horner's method for high-to-low: start from highest degree
  let result = poly[0];
  for (let i = 1; i < poly.length; i++) {
    result = gfAdd(gfMul(result, x), poly[i]);
  }
  return result;
}
