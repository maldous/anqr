import { computeECC } from './rs-basis';

export function extractBlocksFromBuffer(
  bufferBytes: number[] | Uint8Array,
  rsBlocks: Array<{ dataCount: number; totalCount: number }>
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
} {
  const blockDataArrays: Uint8Array[] = [];
  const blockEccArrays: Uint8Array[] = [];
  const blockDataCounts: number[] = [];
  const blockEccCounts: number[] = [];

  let offset = 0;
  for (const block of rsBlocks) {
    const blockData = new Uint8Array(block.dataCount);
    for (let i = 0; i < block.dataCount; i++) {
      blockData[i] = bufferBytes[offset + i] & 0xff;
    }
    blockDataArrays.push(blockData);
    blockDataCounts.push(block.dataCount);

    const eccCount = block.totalCount - block.dataCount;
    blockEccCounts.push(eccCount);

    const eccBytes = computeECC(blockData, eccCount);
    blockEccArrays.push(eccBytes);

    offset += block.dataCount;
  }

  return { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts };
}
