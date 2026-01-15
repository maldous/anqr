import {GF_EXP, GF_LOG, b} from '../shared';
/** Divide two numbers in GF(2^8) */
export function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero in GF');
  if (a === 0) return 0;
  return GF_EXP[(GF_LOG[a] + 255 - GF_LOG[b]) % 255];
}

