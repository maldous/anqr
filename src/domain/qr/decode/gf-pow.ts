import { GF_EXP } from './gf-exp';
import { GF_LOG } from './gf-log';

/**
 * GF(256) power: a^n
 * Handles negative exponents and large positive exponents
 */
export function _gfPow(a: number, n: number): number {
  if (a === 0) return n === 0 ? 1 : 0;
  // Normalize exponent to positive range
  let exp = (GF_LOG[a] * n) % 255;
  if (exp < 0) exp += 255;
  return GF_EXP[exp];
}
