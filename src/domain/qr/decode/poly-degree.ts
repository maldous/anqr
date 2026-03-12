// ============================================
// Polynomial Operations in GF(256)
// Using HIGH-TO-LOW convention (GenericGFPoly style):
// - coefficients[0] = coefficient of highest degree term
// - coefficients[length-1] = constant term (x^0)
// ============================================

/**
 * Get degree of polynomial (high-to-low convention)
 */
export function polyDegree(poly: number[]): number {
  if (poly.length === 0) return 0;
  // First non-zero coefficient determines degree
  for (let i = 0; i < poly.length; i++) {
    if (poly[i] !== 0) return poly.length - 1 - i;
  }
  return 0; // Zero polynomial
}
