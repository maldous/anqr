import {GF_EXP, for, i, message, nsym, syndromes} from '../shared';
import { gfPolyEval } from '../gf/gfPolyEval';
// ============================================
// REED-SOLOMON DECODER
// ============================================

/** Calculate syndromes for received message */
export function rsCalcSyndromes(msg: number[], nsym: number): number[] {
  const synd = new Array(nsym).fill(0);
  for (let i = 0; i < nsym; i++) {
    synd[i] = gfPolyEval(msg, GF_EXP[i]);
  }
  return synd;
}

