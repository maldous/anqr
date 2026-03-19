import type { RSBlock } from "../qr-encoder/types";

export function createRSBlock(totalCount: number, dataCount: number): RSBlock {
  return { totalCount, dataCount };
}
