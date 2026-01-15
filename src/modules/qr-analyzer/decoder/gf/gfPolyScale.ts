import {p, x} from '../shared';
import { gfMul } from '../gf/gfMul';
/** Multiply polynomial by scalar */
export function gfPolyScale(p: number[], x: number): number[] {
  return p.map(coef => gfMul(coef, x));
}

