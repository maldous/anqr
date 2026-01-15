import {codeword, corrected, nsym} from '../shared';
/** Correct errors in a codeword. Returns corrected data or null if uncorrectable. */
export function rsCorrectErrors(
  msg: number[],
  nsym: number
): { corrected: number[]; errorCount: number }

