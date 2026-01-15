import {GF_EXP, GF_LOG, b} from '../shared';
/** Multiply two numbers in GF(2^8) */
export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

