/**
 * GF(256) addition (XOR)
 * Note: In GF(2^n), addition and subtraction are both XOR
 */
export function gfAdd(a: number, b: number): number {
  return a ^ b;
}
