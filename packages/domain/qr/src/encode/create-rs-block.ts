import type { RSBlock } from "./types";

export function createRSBlock(totalCount: number, dataCount: number): RSBlock {
  return { totalCount, dataCount };
}
