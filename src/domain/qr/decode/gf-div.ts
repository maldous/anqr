import { GF_EXP } from './gf-exp';
import { GF_LOG } from './gf-log';

/**
 * GF(256) division using log/exp tables
 */
export function _gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero in GF(256)');
  if (a === 0) return 0;
  return GF_EXP[(GF_LOG[a] - GF_LOG[b] + 255) % 255];
}
