import { GF_EXP } from './gf-exp';
import { GF_LOG } from './gf-log';

/**
 * GF(256) multiplication using log/exp tables
 */
export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}
