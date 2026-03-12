import { gfMul } from './gf-mul';

/**
 * Multiply polynomial by scalar (high-to-low convention)
 */
export function polyMultiplyScalar(poly: number[], scalar: number): number[] {
  if (scalar === 0) return [0];
  return poly.map((c) => gfMul(c, scalar));
}
