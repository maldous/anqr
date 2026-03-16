import { gfMul } from "./rs-rootability-gf";

export function polyEvalHighToLow(coeffs: number[], x: number): number {
  let y = 0;

  for (let i = 0; i < coeffs.length; i++) {
    y = gfMul(y, x) ^ (coeffs[i] ?? 0);
  }

  return y;
}
