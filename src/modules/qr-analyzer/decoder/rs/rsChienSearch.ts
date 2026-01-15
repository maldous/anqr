import {GF_EXP, code, errLoc, errPos, for, i, t} from '../shared';
import { gfPolyEval } from '../gf/gfPolyEval';
/** Find error positions using Chien search */
export function rsChienSearch(errLoc: number[], msgLen: number): number[] | null {
  const numErrors = errLoc.length - 1;
  const errPos: number[] = [];
  
  for (let i = 0; i < msgLen; i++) {
    if (gfPolyEval(errLoc, GF_EXP[i]) === 0) {
      errPos.push(msgLen - 1 - i);
    }
  }
  
  // If we didn't find all error positions, the code is uncorrectable
  if (errPos.length !== numErrors) {
    return null;
  }
  
  return errPos;
}

