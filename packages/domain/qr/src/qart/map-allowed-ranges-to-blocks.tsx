import { type ECCLevel, getRSBlockInfo } from "./bit-mapping";
import type { BitRange } from "./semantic-layout.types";
import { findBlockForLinearByte } from "./find-block-for-linear-byte";
import { log } from "./log";
import { logBlockMappingResults } from "./log-block-mapping-results";

/**
 * Map allowed bit ranges from the LINEAR BUFFER to per-block allowed bits.
 *
 * CRITICAL FIX: The input allowedRanges are in LINEAR BUFFER coordinates,
 * NOT interleaved coordinates! The linear buffer is filled sequentially,
 * then SPLIT into blocks:
 *   - Block 0 gets linear bytes [0, block0.dataCount)
 *   - Block 1 gets linear bytes [block0.dataCount, block0.dataCount + block1.dataCount)
 *   - etc.
 *
 * This function maps linear buffer bit positions to per-block local bit positions.
 * Interleaving happens AFTER block splitting (during matrix placement), so we
 * must NOT simulate interleaving here.
 *
 * @param allowedRanges Allowed bit ranges in LINEAR BUFFER coordinates
 * @param version QR version
 * @param ecc Error correction level
 * @returns Map of blockIndex -> set of allowed local bit indices
 */
export function mapAllowedRangesToBlocks(
  allowedRanges: BitRange[],
  version: number,
  ecc: ECCLevel,
): Map<number, Set<number>> {
  const blocks = getRSBlockInfo(version, ecc);
  const numBlocks = blocks.length;

  // Calculate block byte boundaries in the LINEAR buffer
  // Block 0 starts at offset 0, Block 1 starts at block0.dataCount, etc.
  const blockStartBytes: number[] = [];
  const blockEndBytes: number[] = [];
  let offset = 0;
  for (const block of blocks) {
    blockStartBytes.push(offset);
    blockEndBytes.push(offset + block.dataCount);
    offset += block.dataCount;
  }
  const totalLinearBytes = offset;

  log.debug("Block boundaries in linear buffer", {
    numBlocks,
    blockStartBytes,
    blockEndBytes,
    totalLinearBytes,
    blockDataCounts: blocks.map((b) => b.dataCount),
  });

  // Result: per-block set of allowed local bit indices
  const blockAllowedBits = new Map<number, Set<number>>();
  for (let i = 0; i < numBlocks; i++) {
    blockAllowedBits.set(i, new Set());
  }

  // For each allowed range, map linear buffer positions to per-block positions
  for (const range of allowedRanges) {
    log.debug("Processing allowed range", {
      startBit: range.startBit,
      endBit: range.endBit,
      startByte: Math.floor(range.startBit / 8),
      endByte: Math.ceil(range.endBit / 8),
    });

    for (let linearBit = range.startBit; linearBit < range.endBit; linearBit++) {
      const linearByte = Math.floor(linearBit / 8);
      const bitInByte = linearBit % 8; // 0 = MSB (first bit in stream)

      // Skip if beyond total buffer
      if (linearByte >= totalLinearBytes) {
        continue;
      }

      const blockMatch = findBlockForLinearByte(
        linearByte,
        blockStartBytes,
        blockEndBytes,
        numBlocks,
      );
      if (blockMatch) {
        const localBitIndex = blockMatch.localByte * 8 + bitInByte;
        blockAllowedBits.get(blockMatch.blockIdx)!.add(localBitIndex);
      }
    }
  }

  logBlockMappingResults(
    blockAllowedBits,
    blocks,
    blockStartBytes,
    blockEndBytes,
    numBlocks,
    allowedRanges,
  );

  return blockAllowedBits;
}
