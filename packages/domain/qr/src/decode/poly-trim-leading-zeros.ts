/**
 * Remove leading zeros from polynomial (high-to-low convention)
 */
export function polyTrimLeadingZeros(poly: number[]): number[] {
  let firstNonZero = 0;
  while (firstNonZero < poly.length - 1 && poly[firstNonZero] === 0) {
    firstNonZero++;
  }
  if (firstNonZero === 0) return poly;
  return poly.slice(firstNonZero);
}
