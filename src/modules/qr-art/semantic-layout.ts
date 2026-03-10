/**
 * QR-Art Semantic Bit Layout
 *
 * This module provides exact bit-level tracking of QR code semantic boundaries.
 * Critical for Strategy 2 QR-Art: only padding codewords are controllable.
 *
 * QR data stream structure (in order):
 * 1. Mode indicator (4 bits)
 * 2. Character count (8-16 bits depending on version)
 * 3. Data content (dataLength * 8 bits for byte mode)
 * 4. Terminator (0-4 bits, as many as fit)
 * 5. Pad-to-byte (0-7 zero bits to reach byte boundary)
 * 6. Pad codewords (alternating 0xEC, 0x11 to fill capacity)
 *
 * ONLY pad codewords (#6) are safe to modify without corrupting the message.
 */

import { createLogger } from '../../lib/logger';
import { QRMode } from '../qr-encoder/types';
import { getLengthInBits } from '../qr-encoder/utils';
import { type ECCLevel, getRSBlockInfo } from './bit-mapping';

const log = createLogger('QART');

/**
 * A range of bits (in the pre-interleaved data stream)
 */
export interface BitRange {
  /** Start bit index (inclusive, 0-indexed) */
  startBit: number;
  /** End bit index (exclusive) */
  endBit: number;
}

/**
 * Exact bit positions for QR semantic boundaries
 * All positions are in the PRE-INTERLEAVED data stream (before RS block interleaving)
 */
export interface SemanticBitLayout {
  /** Mode indicator: 4 bits identifying encoding mode */
  modeIndicator: BitRange;

  /** Character count: variable length depending on version and mode */
  characterCount: BitRange;

  /** Data content: the actual encoded payload */
  dataContent: BitRange;

  /** Terminator: 0000 pattern (up to 4 bits if room) */
  terminator: BitRange;

  /** Pad-to-byte: zero bits to reach byte boundary */
  padToByte: BitRange;

  /** Pad codewords: 0xEC 0x11 pattern to fill remaining capacity */
  padCodewords: BitRange & { byteCount: number };

  /** Total data bits (excluding ECC) */
  totalDataBits: number;

  /** Total data bytes */
  totalDataBytes: number;

  /** Version used */
  version: number;

  /** ECC level used */
  ecc: ECCLevel;

  /** Original data length in characters */
  dataLength: number;
}

/**
 * Calculate the semantic bit layout for a QR code
 *
 * This precisely tracks where each semantic region starts and ends,
 * which is critical for knowing which bits can be safely modified.
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @param dataLength Length of the data string in characters
 * @returns Complete semantic bit layout
 */
export function getSemanticBitLayout(
  version: number,
  ecc: ECCLevel,
  dataLength: number
): SemanticBitLayout {
  // Calculate total data capacity
  const blocks = getRSBlockInfo(version, ecc);
  const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
  const totalDataBits = totalDataBytes * 8;

  // Mode indicator: always 4 bits
  const modeIndicatorStart = 0;
  const modeIndicatorEnd = 4;

  // Character count: depends on version and mode (using byte mode)
  const charCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, version);
  const characterCountStart = modeIndicatorEnd;
  const characterCountEnd = characterCountStart + charCountBits;

  // Data content: 8 bits per character in byte mode
  const dataContentStart = characterCountEnd;
  const dataContentEnd = dataContentStart + dataLength * 8;

  // How many bits used so far
  let currentBit = dataContentEnd;

  // Terminator: up to 4 bits (0000), but only as many as fit
  const remainingBitsForTerminator = totalDataBits - currentBit;
  const terminatorBits = Math.min(4, remainingBitsForTerminator);
  const terminatorStart = currentBit;
  const terminatorEnd = terminatorStart + terminatorBits;
  currentBit = terminatorEnd;

  // Pad-to-byte: zero bits to reach byte boundary
  const bitsToNextByte = (8 - (currentBit % 8)) % 8;
  const padToByteStart = currentBit;
  const padToByteEnd = padToByteStart + bitsToNextByte;
  currentBit = padToByteEnd;

  // Pad codewords: remaining bytes filled with 0xEC 0x11 pattern
  const padCodewordsStart = currentBit;
  const padCodewordsEnd = totalDataBits;
  const padCodewordsByteCount = (padCodewordsEnd - padCodewordsStart) / 8;

  const layout: SemanticBitLayout = {
    modeIndicator: { startBit: modeIndicatorStart, endBit: modeIndicatorEnd },
    characterCount: { startBit: characterCountStart, endBit: characterCountEnd },
    dataContent: { startBit: dataContentStart, endBit: dataContentEnd },
    terminator: { startBit: terminatorStart, endBit: terminatorEnd },
    padToByte: { startBit: padToByteStart, endBit: padToByteEnd },
    padCodewords: {
      startBit: padCodewordsStart,
      endBit: padCodewordsEnd,
      byteCount: padCodewordsByteCount,
    },
    totalDataBits,
    totalDataBytes,
    version,
    ecc,
    dataLength,
  };

  log.info('Semantic bit layout calculated', {
    version,
    ecc,
    dataLength,
    totalDataBytes,
    totalDataBits,
    modeIndicator: `bits ${modeIndicatorStart}-${modeIndicatorEnd} (${modeIndicatorEnd - modeIndicatorStart} bits)`,
    characterCount: `bits ${characterCountStart}-${characterCountEnd} (${charCountBits} bits)`,
    dataContent: `bits ${dataContentStart}-${dataContentEnd} (${dataLength * 8} bits)`,
    terminator: `bits ${terminatorStart}-${terminatorEnd} (${terminatorBits} bits)`,
    padToByte: `bits ${padToByteStart}-${padToByteEnd} (${bitsToNextByte} bits)`,
    padCodewords: `bits ${padCodewordsStart}-${padCodewordsEnd} (${padCodewordsByteCount} bytes)`,
    controllableBits: padCodewordsEnd - padCodewordsStart,
    controllablePercent: `${(((padCodewordsEnd - padCodewordsStart) / totalDataBits) * 100).toFixed(1)}%`,
  });

  return layout;
}

/**
 * Find the smallest QR version that can encode the data with at least
 * minPadCodewords of padding codewords available for QR-Art manipulation.
 *
 * @param dataLength Length of the data string
 * @param ecc Error correction level
 * @param minPadCodewords Minimum padding codewords required (default: 20)
 * @returns Optimal version number
 */
export function calculateVersionForSlack(
  dataLength: number,
  ecc: ECCLevel,
  minPadCodewords: number = 20
): number {
  for (let version = 1; version <= 40; version++) {
    const layout = getSemanticBitLayout(version, ecc, dataLength);

    if (layout.padCodewords.byteCount >= minPadCodewords) {
      log.debug('Found version with sufficient slack', {
        version,
        padCodewords: layout.padCodewords.byteCount,
        minRequired: minPadCodewords,
      });
      return version;
    }
  }

  // If no version has enough slack, return the largest
  log.warn('No version has sufficient pad codewords, using version 40', {
    dataLength,
    ecc,
    minPadCodewords,
  });
  return 40;
}

function findBlockForLinearByte(
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
  ecc: ECCLevel
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

  log.debug('Block boundaries in linear buffer', {
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
    log.debug('Processing allowed range', {
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
        numBlocks
      );
      if (blockMatch) {
        const localBitIndex = blockMatch.localByte * 8 + bitInByte;
        blockAllowedBits.get(blockMatch.blockIdx)!.add(localBitIndex);
      }
    }
  }

  // Log the mapping results with details
  let totalAllowedBits = 0;
  for (const [blockIdx, allowedSet] of blockAllowedBits) {
    totalAllowedBits += allowedSet.size;

    // Find the range of allowed local bits for logging
    const sortedBits = Array.from(allowedSet).sort((a, b) => a - b);
    const minBit = sortedBits.length > 0 ? sortedBits[0] : -1;
    const maxBit = sortedBits.length > 0 ? sortedBits[sortedBits.length - 1] : -1;

    log.info('Block allowed bits mapped (LINEAR algorithm)', {
      blockIndex: blockIdx,
      allowedBitCount: allowedSet.size,
      allowedByteCount: Math.ceil(allowedSet.size / 8),
      blockDataBytes: blocks[blockIdx].dataCount,
      blockTotalBits: blocks[blockIdx].dataCount * 8,
      localBitRange: minBit >= 0 ? `${minBit} - ${maxBit}` : 'none',
      localByteRange:
        minBit >= 0 ? `${Math.floor(minBit / 8)} - ${Math.floor(maxBit / 8)}` : 'none',
      linearByteRange: `${blockStartBytes[blockIdx]} - ${blockEndBytes[blockIdx] - 1}`,
    });
  }

  log.info('Total allowed bits across all blocks', {
    totalAllowedBits,
    numBlocks,
    inputRanges: allowedRanges.map((r) => `${r.startBit}-${r.endBit}`),
    expectedBits: allowedRanges.reduce((sum, r) => sum + (r.endBit - r.startBit), 0),
    matches:
      totalAllowedBits === allowedRanges.reduce((sum, r) => sum + (r.endBit - r.startBit), 0),
  });

  return blockAllowedBits;
}

/**
 * Check if a given bit index (in block-local coordinates) is within allowed ranges
 *
 * @param blockAllowedBits Per-block allowed bit sets
 * @param blockIndex RS block index
 * @param localBitIndex Bit index within the block (0-indexed)
 * @returns True if this bit can be modified
 */
export function isBitAllowed(
  blockAllowedBits: Map<number, Set<number>>,
  blockIndex: number,
  localBitIndex: number
): boolean {
  const allowedSet = blockAllowedBits.get(blockIndex);
  if (!allowedSet) return false;
  return allowedSet.has(localBitIndex);
}

/**
 * Validate that selected vectors only affect allowed bits
 *
 * @param selectedVectorBits Array of { blockIndex, affectedLocalBits } for each selected vector
 * @param blockAllowedBits Per-block allowed bit sets
 * @returns Validation result with any violations
 */
export function validateVectorSelection(
  selectedVectorBits: Array<{ blockIndex: number; affectedLocalBits: number[] }>,
  blockAllowedBits: Map<number, Set<number>>
): { valid: boolean; violations: Array<{ blockIndex: number; bit: number }> } {
  const violations: Array<{ blockIndex: number; bit: number }> = [];

  for (const vector of selectedVectorBits) {
    const allowedSet = blockAllowedBits.get(vector.blockIndex);
    if (!allowedSet) {
      // Entire block is protected
      for (const bit of vector.affectedLocalBits) {
        violations.push({ blockIndex: vector.blockIndex, bit });
      }
      continue;
    }

    for (const bit of vector.affectedLocalBits) {
      if (!allowedSet.has(bit)) {
        violations.push({ blockIndex: vector.blockIndex, bit });
      }
    }
  }

  if (violations.length > 0) {
    log.warn('Vector selection violates protected bits!', {
      violationCount: violations.length,
      sampleViolations: violations.slice(0, 10),
    });
  }

  return { valid: violations.length === 0, violations };
}
