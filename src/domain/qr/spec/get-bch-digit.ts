/**
 * Get the number of bits needed to represent a number
 */
export function getBCHDigit(data: number): number {
  let digit = 0;
  let d = data;
  while (d !== 0) {
    digit += 1;
    d >>>= 1;
  }
  return digit;
}
