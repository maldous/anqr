/**
 * Build monomial: coefficient * x^degree (high-to-low convention)
 */
export function buildMonomial(degree: number, coeff: number): number[] {
  if (coeff === 0) return [0];
  const result = new Array(degree + 1).fill(0);
  result[0] = coeff; // Leading coefficient
  return result;
}
