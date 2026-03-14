import { GF_EXP } from './gf-exp.const';
import { GF_LOG } from './gf-log.const';

export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}
