import type { BitRange } from "./semantic-layout.types";
import { log } from "./log";

export function logBlockMappingResults(
  blockAllowedBits: Map<number, Set<number>>,
  blocks: Array<{ dataCount: number }>,
  blockStartBytes: number[],
  blockEndBytes: number[],
  numBlocks: number,
  allowedRanges: BitRange[],
): void {
  let totalAllowedBits = 0;
  for (const [blockIdx, allowedSet] of blockAllowedBits) {
    totalAllowedBits += allowedSet.size;

    const sortedBits = Array.from(allowedSet).sort((a, b) => a - b);
    const minBit = sortedBits.length > 0 ? sortedBits[0] : -1;
    const maxBit = sortedBits.length > 0 ? sortedBits[sortedBits.length - 1] : -1;

    log.info("Block allowed bits mapped (LINEAR algorithm)", {
      blockIndex: blockIdx,
      allowedBitCount: allowedSet.size,
      allowedByteCount: Math.ceil(allowedSet.size / 8),
      blockDataBytes: blocks[blockIdx].dataCount,
      blockTotalBits: blocks[blockIdx].dataCount * 8,
      localBitRange: minBit >= 0 ? `${minBit} - ${maxBit}` : "none",
      localByteRange:
        minBit >= 0 ? `${Math.floor(minBit / 8)} - ${Math.floor(maxBit / 8)}` : "none",
      linearByteRange: `${blockStartBytes[blockIdx]} - ${blockEndBytes[blockIdx] - 1}`,
    });
  }

  log.info("Total allowed bits across all blocks", {
    totalAllowedBits,
    numBlocks,
    inputRanges: allowedRanges.map((r) => `${r.startBit}-${r.endBit}`),
    expectedBits: allowedRanges.reduce((sum, r) => sum + (r.endBit - r.startBit), 0),
    matches:
      totalAllowedBits === allowedRanges.reduce((sum, r) => sum + (r.endBit - r.startBit), 0),
  });
}
