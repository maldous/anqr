import type { RSBlockInfo } from './bit-mapping';

/**
 * Simulate the QR interleaving pattern to determine the highest protected byte
 * index in each RS block.
 */
export function simulateInterleavingProtection(
  rsBlockInfo: RSBlockInfo[],
  numBlocks: number,
  protectedByteCount: number
): number[] {
  const maxProtectedByteInBlock: number[] = Array.from({ length: numBlocks }, () => -1);
  const maxDataCount = Math.max(...rsBlockInfo.map((b) => b.dataCount));
  let interleavedByteIndex = 0;

  for (let bytePos = 0; bytePos < maxDataCount; bytePos++) {
    for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
      if (bytePos >= rsBlockInfo[blockIdx].dataCount) continue;

      if (
        interleavedByteIndex < protectedByteCount &&
        bytePos > maxProtectedByteInBlock[blockIdx]
      ) {
        maxProtectedByteInBlock[blockIdx] = bytePos;
      }
      interleavedByteIndex++;
      if (interleavedByteIndex >= protectedByteCount) break;
    }
    if (interleavedByteIndex >= protectedByteCount) break;
  }

  return maxProtectedByteInBlock;
}
