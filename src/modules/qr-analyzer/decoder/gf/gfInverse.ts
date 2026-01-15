import {GF_EXP, GF_LOG, x} from '../shared';
/** Multiplicative inverse in GF(2^8) */
export function gfInverse(x: number): number {
  return GF_EXP[255 - GF_LOG[x]];
}

