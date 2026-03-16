import { gfMul } from "./rs-rootability-gf";

export function polyEvalAsc(poly: number[], x: number): number {
  let y = 0;
  let p = 1;

  for (let i = 0; i < poly.length; i++) {
    y ^= gfMul(poly[i] ?? 0, p);
    p = gfMul(p, x);
  }

  return y;
}
