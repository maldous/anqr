import type { BlockLayout } from './block-layout.interface';

export function expandBlockDefinitions(rsBlocks: number[][]): BlockLayout {
  const blockDataSizes: number[] = [];
  const blockTotalSizes: number[] = [];
  for (const g of rsBlocks) {
    const numBlocks = g[0];
    const total = g[1];
    const data = g[2];
    for (let i = 0; i < numBlocks; i++) {
      blockDataSizes.push(data);
      blockTotalSizes.push(total);
    }
  }
  const blockEccSizes = blockTotalSizes.map((t, i) => t - (blockDataSizes[i] ?? 0));
  return {
    blockDataSizes,
    blockEccSizes,
    numBlocks: blockDataSizes.length,
    maxData: Math.max(...blockDataSizes),
    maxEcc: Math.max(...blockEccSizes),
  };
}
