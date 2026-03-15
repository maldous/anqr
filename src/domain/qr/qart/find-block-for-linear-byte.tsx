export function findBlockForLinearByte(
  linearByte: number,
  blockStartBytes: number[],
  blockEndBytes: number[],
  numBlocks: number
): { blockIdx: number; localByte: number } | null {
  for (let b = 0; b < numBlocks; b++) {
    if (linearByte >= blockStartBytes[b] && linearByte < blockEndBytes[b]) {
      return { blockIdx: b, localByte: linearByte - blockStartBytes[b] };
    }
  }
  return null;
}
