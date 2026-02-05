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
import { getLengthInBits } from '../qr-encoder/utils';
import { QRMode } from '../qr-encoder/types';
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

/**
 * Map allowed bit ranges from the pre-interleaved stream to per-block allowed bits.
 *
 * The QR data stream is interleaved across RS blocks before placement:
 * - Interleaved byte 0 = Block 0 byte 0
 * - Interleaved byte 1 = Block 1 byte 0 (if 2+ blocks)
 * - etc.
 *
 * This function traces which bytes in each block correspond to the allowed
 * bit ranges in the pre-interleaved stream.
 *
 * @param allowedRanges Allowed bit ranges in pre-interleaved stream
 * @param version QR version
 * @param ecc Error correction level
 * @returns Map of blockIndex -> array of allowed local bit indices
 */
export function mapAllowedRangesToBlocks(
  allowedRanges: BitRange[],
  version: number,
  ecc: ECCLevel
): Map<number, Set<number>> {
  const blocks = getRSBlockInfo(version, ecc);
  const numBlocks = blocks.length;

  // Build a set of allowed bit indices (in pre-interleaved stream)
  const allowedBits = new Set<number>();
  for (const range of allowedRanges) {
    for (let bit = range.startBit; bit < range.endBit; bit++) {
      allowedBits.add(bit);
    }
  }

  // Result: per-block set of allowed local bit indices
  const blockAllowedBits = new Map<number, Set<number>>();
  for (let i = 0; i < numBlocks; i++) {
    blockAllowedBits.set(i, new Set());
  }

  // Find max data count for interleaving
  const maxDataCount = Math.max(...blocks.map((b) => b.dataCount));

  // Simulate the interleaving pattern
  let interleavedByteIndex = 0;

  for (let bytePos = 0; bytePos < maxDataCount; bytePos++) {
    for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
      if (bytePos < blocks[blockIdx].dataCount) {
        // This block contributes a byte at this interleaved position
        // Check which bits of this interleaved byte are allowed
        const interleavedBitStart = interleavedByteIndex * 8;

        for (let bitInByte = 0; bitInByte < 8; bitInByte++) {
          const interleavedBitIndex = interleavedBitStart + bitInByte;
          if (allowedBits.has(interleavedBitIndex)) {
            // This bit is allowed - map to local block position
            // Local bit index = bytePos * 8 + bitInByte
            const localBitIndex = bytePos * 8 + bitInByte;
            blockAllowedBits.get(blockIdx)!.add(localBitIndex);
          }
        }

        interleavedByteIndex++;
      }
    }
  }

  // Log the mapping
  for (const [blockIdx, allowedSet] of blockAllowedBits) {
    if (allowedSet.size > 0) {
      log.debug('Block allowed bits mapped', {
        blockIndex: blockIdx,
        allowedBitCount: allowedSet.size,
        allowedByteCount: Math.ceil(allowedSet.size / 8),
        blockDataBytes: blocks[blockIdx].dataCount,
      });
    }
  }

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
    log.error('Vector selection violates protected bits!', {
      violationCount: violations.length,
      sampleViolations: violations.slice(0, 10),
    });
  }

  return { valid: violations.length === 0, violations };
}
