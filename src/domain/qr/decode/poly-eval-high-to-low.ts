import { gfMul } from "./rs-rootability-gf";

export function polyEvalHighToLow(coeffs: number[], x: number): number {
  let y = 0;

  for (const coeff of coeffs) {
    y = gfMul(y, x) ^ (coeff ?? 0);
  }

  return y;
}
