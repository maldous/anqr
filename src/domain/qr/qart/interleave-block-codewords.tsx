export function interleaveBlockCodewords(
  blockCodewords: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
): number[] {
  const maxDataCount = Math.max(...blockDataCounts);
  const maxEccCount = Math.max(...blockEccCounts);
  const interleaved: number[] = [];

  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < blockCodewords.length; b++) {
      if (i < blockDataCounts[b]) {
        interleaved.push(blockCodewords[b][i]);
      }
    }
  }

  for (let i = 0; i < maxEccCount; i++) {
    for (let b = 0; b < blockCodewords.length; b++) {
      if (i < blockEccCounts[b]) {
        interleaved.push(blockCodewords[b][blockDataCounts[b] + i]);
      }
    }
  }

  return interleaved;
}
