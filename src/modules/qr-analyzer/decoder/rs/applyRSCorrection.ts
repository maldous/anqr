import {ECCLevel, blocks, eccLevel, errorsCorrected} from '../shared';
/** Apply RS error correction to all blocks and reassemble data */
export function applyRSCorrection(
  codewords: number[],
  version: number,
  eccLevel: ECCLevel
): { data: number[]; errorsCorrected: number }

