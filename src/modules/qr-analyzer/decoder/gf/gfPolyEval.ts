import {for, i, p, result, x} from '../shared';
import { gfMul } from '../gf/gfMul';
/** Evaluate polynomial at x */
export function gfPolyEval(p: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < p.length; i++) {
    result = gfMul(result, x) ^ p[i];
  }
  return result;
}

