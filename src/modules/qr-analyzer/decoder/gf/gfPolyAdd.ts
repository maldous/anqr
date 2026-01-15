import {for, i, p, result} from '../shared';
/** Add two polynomials (XOR in GF(2^8)) */
export function gfPolyAdd(p: number[], q: number[]): number[] {
  const result = new Array(Math.max(p.length, q.length)).fill(0);
  for (let i = 0; i < p.length; i++) {
    result[i + result.length - p.length] ^= p[i];
  }
  for (let i = 0; i < q.length; i++) {
    result[i + result.length - q.length] ^= q[i];
  }
  return result;
}

