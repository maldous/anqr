/**
 * Check if polynomial is zero
 */
export function polyIsZero(poly: number[]): boolean {
  return poly.every((c) => c === 0);
}
