import {GF_EXP, errLoc, errPos, for, i, magnitude, nsym, of, pos, syndromes, x} from '../shared';
import { gfDiv } from '../gf/gfDiv';
import { gfInverse } from '../gf/gfInverse';
import { gfMul } from '../gf/gfMul';
import { gfPolyEval } from '../gf/gfPolyEval';
import { gfPolyMul } from '../gf/gfPolyMul';
/** Calculate error magnitudes using Forney algorithm */
export function rsForney(
  syndromes: number[],
  errLoc: number[],
  errPos: number[],
  msgLen: number
): number[] {
  // Compute error evaluator polynomial
  // Omega(x) = S(x) * Lambda(x) mod x^nsym
  const nsym = syndromes.length;
  let omega = gfPolyMul([1, ...syndromes], errLoc);
  omega = omega.slice(omega.length - nsym);
  
  // Compute formal derivative of error locator
  const errLocPrime: number[] = [];
  for (let i = errLoc.length - 1; i >= 0; i -= 2) {
    if (i > 0) {
      errLocPrime.unshift(errLoc[errLoc.length - 1 - i]);
    }
  }
  
  // Calculate error magnitudes
  const magnitude: number[] = [];
  for (const pos of errPos) {
    const xi = GF_EXP[msgLen - 1 - pos];
    const xiInv = gfInverse(xi);
    
    // Evaluate omega at xi^-1
    const omegaVal = gfPolyEval(omega, xiInv);
    
    // Evaluate derivative at xi^-1
    const primeVal = gfPolyEval(errLocPrime, xiInv);
    
    if (primeVal === 0) {
      magnitude.push(0);
    } else {
      // Error magnitude = omega(xi^-1) / (xi * lambda'(xi^-1))
      magnitude.push(gfMul(xi, gfDiv(omegaVal, primeVal)));
    }
  }
  
  return magnitude;
}

