/**
 * De-interleave codewords into per-block arrays.
 */
export function deinterleaveByBlock(
  codewords: number[],
  countsPerBlock: number[],
  maxCount: number,
  startIdx: number,
): { blocks: number[][]; nextIdx: number } {
  const numBlocks = countsPerBlock.length;
  const blocks: number[][] = Array.from({ length: numBlocks }, () => []);
  let idx = startIdx;
  for (let pos = 0; pos < maxCount; pos++) {
    for (let b = 0; b < numBlocks; b++) {
      if (pos < countsPerBlock[b] && idx < codewords.length) {
        blocks[b].push(codewords[idx++]);
      }
    }
  }
  return { blocks, nextIdx: idx };
}
