import { GF_EXP } from "./gf-exp.const";
import { GF_LOG } from "./gf-log.const";

export function gfInv(a: number): number {
  if (a === 0) throw new Error("Cannot invert 0 in GF");
  return GF_EXP[255 - GF_LOG[a]];
}
