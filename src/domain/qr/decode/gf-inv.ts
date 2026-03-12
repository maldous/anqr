import { GF_EXP } from './gf-exp';
import { GF_LOG } from './gf-log';

/**
 * GF(256) inverse: a^(-1)
 */
export function gfInv(a: number): number {
  if (a === 0) throw new Error('Inverse of zero in GF(256)');
  return GF_EXP[255 - GF_LOG[a]];
}
