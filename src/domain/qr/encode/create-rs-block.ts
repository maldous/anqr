import type { RSBlock } from '../../../modules/qr-encoder/types';

export function createRSBlock(totalCount: number, dataCount: number): RSBlock {
  return { totalCount, dataCount };
}
