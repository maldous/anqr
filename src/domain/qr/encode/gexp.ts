import { EXP_TABLE } from './exp-table';

/**
 * Galois field exponentiation
 */
export function gexp(n: number): number {
  let exp: number;
  if (n === 0) {
    exp = 0;
  } else if (n > 0) {
    // Keep 255 as a stable index (matching existing table semantics),
    // while still normalizing all higher exponents with GF period 255.
    exp = ((n - 1) % 255) + 1;
  } else {
    exp = n % 255;
    if (exp < 0) exp += 255;
  }
  return EXP_TABLE[exp];
}
