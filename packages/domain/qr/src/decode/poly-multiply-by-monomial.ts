import { gfMul } from "./gf-mul";

/**
 * Multiply polynomial by monomial x^degree * coefficient (high-to-low convention)
 * This shifts the polynomial and scales it
 */
export function polyMultiplyByMonomial(poly: number[], degree: number, coeff: number): number[] {
  if (coeff === 0) return [0];
  const result = Array.from({ length: poly.length + degree }, () => 0);
  for (let i = 0; i < poly.length; i++) {
    result[i] = gfMul(poly[i], coeff);
  }
  return result;
}
