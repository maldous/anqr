/**
 * Get coefficient of x^degree (high-to-low convention)
 */
export function polyGetCoeff(poly: number[], degree: number): number {
  // In high-to-low: coefficient of x^degree is at index (length-1-degree)
  const idx = poly.length - 1 - degree;
  if (idx < 0 || idx >= poly.length) return 0;
  return poly[idx];
}
