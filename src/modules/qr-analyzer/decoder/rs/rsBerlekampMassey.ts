import {errLoc, for, i, j, nsym, syndromes} from '../shared';
import { gfInverse } from '../gf/gfInverse';
import { gfMul } from '../gf/gfMul';
import { gfPolyAdd } from '../gf/gfPolyAdd';
import { gfPolyScale } from '../gf/gfPolyScale';
/** Find error locator polynomial using Berlekamp-Massey algorithm */
export function rsBerlekampMassey(syndromes: number[], nsym: number): number[] {
  // Initialize error locator polynomial
  let errLoc = [1];
  let oldLoc = [1];
  
  for (let i = 0; i < nsym; i++) {
    let delta = syndromes[i];
    // Only use available syndromes; guard against negative indices
    for (let j = 1; j < errLoc.length; j++) {
      const sIndex = i - j;
      if (sIndex < 0) break;
      delta ^= gfMul(errLoc[errLoc.length - 1 - j], syndromes[sIndex]);
    }
    
    oldLoc.push(0);
    
    if (delta !== 0) {
      if (oldLoc.length > errLoc.length) {
        const newLoc = gfPolyScale(oldLoc, delta);
        oldLoc = gfPolyScale(errLoc, gfInverse(delta));
        errLoc = newLoc;
      }
      errLoc = gfPolyAdd(errLoc, gfPolyScale(oldLoc, delta));
    }
  }
  
  // Remove leading zeros
  while (errLoc.length > 0 && errLoc[0] === 0) {
    errLoc.shift();
  }
  
  return errLoc;
}

