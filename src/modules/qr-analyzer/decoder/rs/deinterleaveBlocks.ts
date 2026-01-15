import {RSBlock, blocks, ec, rsBlocks} from '../shared';
/** De-interleave received codewords into RS blocks */
export function deinterleaveBlocks(
  codewords: number[],
  rsBlocks: RSBlock[]
): Array<{ data: number[]; ec: number[] }

