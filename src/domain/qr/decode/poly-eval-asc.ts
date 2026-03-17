import { gfMul } from "./rs-rootability-gf";

export function polyEvalAsc(poly: number[], x: number): number {
  let y = 0;
  let p = 1;

  for (const coeff of poly) {
    y ^= gfMul(coeff ?? 0, p);
    p = gfMul(p, x);
  }

  return y;
}
