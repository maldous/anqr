import {GF_EXP, GF_LOG, x} from '../shared';
/** Raise x to power in GF(2^8) */
export function gfPow(x: number, power: number): number {
  return GF_EXP[(GF_LOG[x] * power) % 255];
}

