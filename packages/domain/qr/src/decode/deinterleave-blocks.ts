import type { BlockLayout } from "./block-layout.types";

export function deinterleaveBlocks(codewords: number[], layout: BlockLayout): number[][] {
  const { blockDataSizes, blockEccSizes, numBlocks, maxData, maxEcc } = layout;
  const blocks: number[][] = Array.from({ length: numBlocks }, () => []);

  let idx = 0;
  for (let i = 0; i < maxData; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < (blockDataSizes[b] ?? 0)) {
        blocks[b]?.push(codewords[idx++] ?? 0);
      }
    }
  }

  for (let i = 0; i < maxEcc; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < (blockEccSizes[b] ?? 0)) {
        blocks[b]?.push(codewords[idx++] ?? 0);
      }
    }
  }

  return blocks;
}
