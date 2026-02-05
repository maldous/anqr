/**
 * QR-Art Reed-Solomon Basis
 *
 * This module builds RS basis vectors for controlling individual QR pixels.
 * Each basis vector represents setting one data bit to 1 and computing
 * the corresponding ECC bytes - a valid RS codeword.
 *
 * The key insight from Russ Cox's QArt:
 * - RS codes are linear: XOR of two valid codewords is also valid
 * - By building a basis of single-bit codewords, we can control pixels
 * - Gauss-Jordan elimination trades control between data and ECC bits
 *
 * IMPORTANT: Content Protection
 * ----------------------------
 * The QArt algorithm modifies data bits to control pixel appearance.
 * However, modifying the CONTENT of the message corrupts the decoded data!
 *
 * The Russ Cox approach uses a URL with a random suffix (like ?q=abc123)
 * that can be freely modified without affecting the destination.
 *
 * This implementation supports two modes:
 * 1. CONTENT PROTECTION (default): Protect header + data content, only modify
 *    padding bits (0xEC 0x11 pattern). Limited control but preserves message.
 * 2. SUFFIX MODE: User provides a suffix that can be freely modified.
 *    The suffix bits become controllable for QR-Art manipulation.
 *
 * The key formula:
 *   Content bits = mode(4) + charCount(8-16) + data(8*length) + terminator(up to 4)
 *   Padding bits = byte alignment(0-7) + padding bytes(0xEC,0x11 pattern)
 *
 * Only padding bits (and optional suffix bits) can be modified without
 * corrupting the message content.
 */

import { createLogger } from '../../lib/logger';
import { gexp, qrPolynomial } from '../qr-encoder/math';
import { QRErrorCorrectionLevel, QRMode } from '../qr-encoder/types';
import { getLengthInBits } from '../qr-encoder/utils';
import { type ECCLevel, getRSBlockInfo, type RSBlockInfo } from './bit-mapping';
import {
  type BitRange,
  type SemanticBitLayout,
  getSemanticBitLayout,
  mapAllowedRangesToBlocks,
} from './semantic-layout';

const log = createLogger('QART');

/**
 * A single RS basis vector
 * Represents setting one bit to 1 and its effect on the codeword
 */
export interface RSBasisVector {
  /** Which data bit this vector controls (global index) */
  dataBitIndex: number;
  /** Which RS block this belongs to */
  rsBlockIndex: number;
  /** Position within the RS block (byte index) */
  posInBlock: number;
  /** Which bit within the byte (0-7, 7=MSB) */
  bitInByte: number;
  /** The complete block data (data + ECC) as a bit vector */
  blockBits: Uint8Array;
  /** Affected pixel indices (will be filled during mapping) */
  affectedPixels: number[];
  /** After elimination: which pixel this primarily controls (-1 if none) */
  pivotPixel: number;
}

/**
 * Complete RS basis for a version/ECC combination
 */
export interface RSBasis {
  version: number;
  ecc: ECCLevel;
  blocks: RSBlockInfo[];
  vectors: RSBasisVector[];
  totalDataBits: number;
  totalEccBits: number;
}

// Cache for computed bases (expensive to compute)
const basisCache = new Map<string, RSBasis>();

/**
 * Convert ECC level to numeric
 */
function _eccToNumeric(ecc: ECCLevel): number {
  switch (ecc) {
    case 'L':
      return QRErrorCorrectionLevel.L;
    case 'M':
      return QRErrorCorrectionLevel.M;
    case 'Q':
      return QRErrorCorrectionLevel.Q;
    case 'H':
      return QRErrorCorrectionLevel.H;
    default:
      return QRErrorCorrectionLevel.M;
  }
}

/**
 * Create the error correction polynomial for a given ECC length
 * This is the generator polynomial g(x) = (x-α^0)(x-α^1)...(x-α^(n-1))
 */
function getErrorCorrectPolynomial(eccCount: number) {
  let a = qrPolynomial([1], 0);
  for (let i = 0; i < eccCount; i++) {
    a = a.multiply(qrPolynomial([1, gexp(i)], 0));
  }
  return a;
}

/**
 * Compute ECC bytes for a data block
 * Uses polynomial division: data * x^eccCount mod generator
 *
 * @param dataBytes The data bytes
 * @param eccCount Number of ECC bytes to generate
 * @returns The ECC bytes
 */
export function computeECC(dataBytes: Uint8Array, eccCount: number): Uint8Array {
  const rsPoly = getErrorCorrectPolynomial(eccCount);
  const rawPoly = qrPolynomial(Array.from(dataBytes), rsPoly.getLength() - 1);
  const modPoly = rawPoly.mod(rsPoly);

  const ecdata = new Uint8Array(eccCount);
  for (let i = 0; i < eccCount; i++) {
    const modIndex = i + modPoly.getLength() - eccCount;
    ecdata[i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
  }

  return ecdata;
}

/**
 * Calculate the number of header bits (mode indicator + character count) for a given version.
 * These bits must NOT be modified by QR-Art or the QR code won't decode properly.
 *
 * @param version QR version (1-40)
 * @returns Number of header bits to skip
 */
export function getHeaderBitCount(version: number): number {
  // Mode indicator is always 4 bits
  const modeBits = 4;
  // Character count length depends on version (for byte mode)
  const charCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, version);
  return modeBits + charCountBits;
}

/**
 * Calculate the number of CONTENT bits (header + data + terminator) for a given version and data length.
 * These bits encode the actual message and must NOT be modified or the decoded data will be corrupted.
 *
 * Content bits = mode(4) + charCount(8-16) + data(8*length) + terminator(up to 4)
 *
 * @param version QR version (1-40)
 * @param dataLength Length of the data string in characters
 * @returns Number of content bits that must be protected
 */
export function getContentBitCount(version: number, dataLength: number): number {
  const headerBits = getHeaderBitCount(version);
  const dataBits = dataLength * 8; // Byte mode: 8 bits per character
  const terminatorBits = 4; // Terminator is up to 4 bits
  return headerBits + dataBits + terminatorBits;
}

/**
 * Information about QR-Art capacity for a given configuration
 */
export interface QRArtCapacityInfo {
  /** QR version being used */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Total data bits in all RS blocks */
  totalDataBits: number;
  /** Number of bits that are protected (header + content) */
  protectedBits: number;
  /** Number of bits available for QR-Art manipulation */
  controllableBits: number;
  /** Percentage of data bits that can be controlled */
  controlPercentage: number;
  /** How the protection is configured */
  protectionMode: 'header-only' | 'full-content';
  /** Breakdown of protected bits */
  breakdown: {
    headerBits: number;
    dataBits: number;
    terminatorBits: number;
    paddingBits: number;
  };
}

/**
 * Analyze QR-Art capacity for a given configuration
 * This helps users understand how much control they have over the QR appearance
 *
 * IMPORTANT: This analysis accounts for interleaving! When we protect N bits
 * of content, those protected bits are distributed across ALL blocks due to
 * the interleaving pattern. The actual controllable bits may be less than
 * the simple "totalDataBits - protectedBits" calculation suggests.
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @param dataLength Length of the data string (for content protection)
 * @returns Capacity analysis information
 */
export function analyzeQRArtCapacity(
  version: number,
  ecc: ECCLevel,
  dataLength: number
): QRArtCapacityInfo {
  const blocks = getRSBlockInfo(version, ecc);
  const totalDataBits = blocks.reduce((sum, b) => sum + b.dataCount * 8, 0);
  
  const headerBits = getHeaderBitCount(version);
  const dataBits = dataLength * 8;
  const terminatorBits = 4;
  const contentBits = headerBits + dataBits + terminatorBits;
  
  // Round up to byte boundary for protected bit count
  const protectedBitCount = Math.ceil(contentBits / 8) * 8;
  
  // Use interleave-aware calculation to get actual protected bits per block
  const protectedBitsPerBlock = calculateProtectedBitsPerBlock(blocks, protectedBitCount);
  
  // Actual protected bits is the sum across all blocks (accounting for interleaving)
  const actualProtectedBits = protectedBitsPerBlock.reduce((sum, b) => sum + b, 0);
  
  // Controllable bits is what remains after protection
  const controllableBits = Math.max(0, totalDataBits - actualProtectedBits);
  
  return {
    version,
    ecc,
    totalDataBits,
    protectedBits: actualProtectedBits,
    controllableBits,
    controlPercentage: totalDataBits > 0 ? (controllableBits / totalDataBits) * 100 : 0,
    protectionMode: 'full-content',
    breakdown: {
      headerBits,
      dataBits,
      terminatorBits,
      paddingBits: controllableBits,
    },
  };
}

/**
 * Calculate how many protected bits belong to each RS block.
 *
 * CRITICAL: QR data is INTERLEAVED before placement into the matrix!
 * The interleaving pattern takes one byte from each block in turn:
 *   Interleaved[0] = Block0[0]
 *   Interleaved[1] = Block1[0]
 *   Interleaved[2] = Block2[0]
 *   ...
 *   Interleaved[N] = Block0[1]
 *   etc.
 *
 * When we protect "the first N bits" of content, those N bits are at the START
 * of the INTERLEAVED stream. This means bytes from ALL blocks may be part of
 * the protected region!
 *
 * For example, to protect the first 19 interleaved bytes with 4 blocks:
 *   - Block0[0..4], Block1[0..4], Block2[0..4], Block3[0..3] are all protected
 *
 * This function correctly handles interleaving by simulating the pattern
 * and tracking which bytes in each block fall within the protected region.
 *
 * @param rsBlockInfo Array of RS block info
 * @param protectedBitCount Total number of bits to protect (in interleaved stream)
 * @returns Array of protected bits per block (index = block index)
 */
export function calculateProtectedBitsPerBlock(
  rsBlockInfo: RSBlockInfo[],
  protectedBitCount: number
): number[] {
  const numBlocks = rsBlockInfo.length;
  const protectedBitsPerBlock = new Array(numBlocks).fill(0);

  if (protectedBitCount === 0 || numBlocks === 0) {
    return protectedBitsPerBlock;
  }

  // Calculate how many interleaved BYTES need protection
  const protectedByteCount = Math.ceil(protectedBitCount / 8);

  // Track the highest byte index in each block that needs protection
  // We protect from byte 0 up to this index (inclusive)
  const maxProtectedByteInBlock: number[] = new Array(numBlocks).fill(-1);

  // Find max data count for interleaving pattern
  const maxDataCount = Math.max(...rsBlockInfo.map((b) => b.dataCount));

  // Simulate interleaving to find which block bytes are in protected positions
  let interleavedByteIndex = 0;

  // Interleaving pattern: for each byte position, iterate through blocks
  for (let bytePos = 0; bytePos < maxDataCount; bytePos++) {
    for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
      // Check if this block has a byte at this position
      if (bytePos < rsBlockInfo[blockIdx].dataCount) {
        // This block contributes a byte at this interleaved position
        if (interleavedByteIndex < protectedByteCount) {
          // This interleaved byte needs protection
          // Update the max protected byte for this block
          if (bytePos > maxProtectedByteInBlock[blockIdx]) {
            maxProtectedByteInBlock[blockIdx] = bytePos;
          }
        }
        interleavedByteIndex++;

        // Early exit if we've covered all protected bytes
        if (interleavedByteIndex >= protectedByteCount) {
          break;
        }
      }
    }
    if (interleavedByteIndex >= protectedByteCount) {
      break;
    }
  }

  // Convert to bit counts: protect from byte 0 to maxProtectedByte (inclusive)
  // This means (maxProtectedByte + 1) * 8 bits are protected
  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    if (maxProtectedByteInBlock[blockIdx] >= 0) {
      protectedBitsPerBlock[blockIdx] = (maxProtectedByteInBlock[blockIdx] + 1) * 8;
    }
  }

  log.debug('Calculated interleave-aware protected bits per block', {
    protectedBitCount,
    protectedByteCount,
    maxProtectedByteInBlock,
    protectedBitsPerBlock,
    blockDataCounts: rsBlockInfo.map((b) => b.dataCount),
  });

  return protectedBitsPerBlock;
}

/**
 * @deprecated Use calculateProtectedBitsPerBlock instead
 * This is kept for backwards compatibility
 */
export function calculateHeaderBitsPerBlock(
  rsBlockInfo: RSBlockInfo[],
  headerBitCount: number
): number[] {
  return calculateProtectedBitsPerBlock(rsBlockInfo, headerBitCount);
}

/**
 * Build basis vectors for a single RS block
 * Each vector has exactly one data bit set to 1, with corresponding ECC
 *
 * @param blockInfo The RS block info
 * @param rsBlockIndex Index of this block
 * @param globalBitOffset Starting global bit index for this block's data
 * @param allowedLocalBits Set of local bit indices that are allowed to be modified (if undefined, all bits allowed)
 * @returns Array of basis vectors for this block
 */
export function buildBlockBasis(
  blockInfo: RSBlockInfo,
  rsBlockIndex: number,
  globalBitOffset: number,
  allowedLocalBits?: Set<number>
): RSBasisVector[] {
  const { dataCount, eccCount, totalCount } = blockInfo;
  const vectors: RSBasisVector[] = [];
  
  // Track statistics for logging
  let skippedCount = 0;
  let createdCount = 0;
  let firstCreatedLocalBit = -1;
  let lastCreatedLocalBit = -1;

  // For each data bit, create a basis vector
  for (let byteIdx = 0; byteIdx < dataCount; byteIdx++) {
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      // dataBitIndex is the global index (used for tracking, not protection)
      const dataBitIndex = globalBitOffset + byteIdx * 8 + (7 - bitIdx);

      // Calculate the local bit index within this block (0-indexed from start of block)
      // Convention: localBitIndex 0 = MSB of byte 0, localBitIndex 7 = LSB of byte 0
      // This matches the linear buffer convention where bit 0 is the first bit written (MSB)
      const localBitIndex = byteIdx * 8 + (7 - bitIdx);

      // If allowedLocalBits is provided, only create vectors for allowed bits
      // This is Strategy 2: only padding codewords are controllable
      if (allowedLocalBits !== undefined && !allowedLocalBits.has(localBitIndex)) {
        skippedCount++;
        continue;
      }

      // Track created range
      if (firstCreatedLocalBit < 0) {
        firstCreatedLocalBit = localBitIndex;
      }
      lastCreatedLocalBit = localBitIndex;
      createdCount++;

      // Create data bytes with just this one bit set
      const dataBytes = new Uint8Array(dataCount);
      dataBytes[byteIdx] = 1 << bitIdx;

      // Compute ECC for this single-bit data
      const eccBytes = computeECC(dataBytes, eccCount);

      // Create the complete block bits (data + ECC)
      const blockBits = new Uint8Array(totalCount);
      blockBits.set(dataBytes, 0);
      blockBits.set(eccBytes, dataCount);

      vectors.push({
        dataBitIndex,
        rsBlockIndex,
        posInBlock: byteIdx,
        bitInByte: bitIdx,
        blockBits,
        affectedPixels: [],
        pivotPixel: -1,
      });
    }
  }
  
  // Log block basis creation details
  if (allowedLocalBits !== undefined) {
    log.debug('Block basis created with protection', {
      blockIndex: rsBlockIndex,
      dataBytes: dataCount,
      totalBlockBits: dataCount * 8,
      allowedBitsProvided: allowedLocalBits.size,
      vectorsCreated: createdCount,
      vectorsSkipped: skippedCount,
      createdLocalBitRange: createdCount > 0 ? `${firstCreatedLocalBit} - ${lastCreatedLocalBit}` : 'none',
      createdByteRange: createdCount > 0 
        ? `${Math.floor(firstCreatedLocalBit / 8)} - ${Math.floor(lastCreatedLocalBit / 8)}`
        : 'none',
    });
  }

  return vectors;
}

/**
 * Build the complete RS basis for a version/ECC combination
 * This creates one basis vector per controllable data bit across all RS blocks
 *
 * STRATEGY 2: Semantic Bit Range Protection
 * When allowedBitRanges is provided, ONLY those bit ranges can be modified.
 * This should be the padding codewords region from SemanticBitLayout.
 *
 * Legacy mode (no ranges): Creates vectors for all data bits (DANGEROUS - corrupts message!)
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @param allowedBitRanges Optional: explicit bit ranges that are allowed to be modified
 *                          (in pre-interleaved stream coordinates)
 * @returns Complete RS basis
 */
export function buildFullBasis(
  version: number,
  ecc: ECCLevel,
  allowedBitRanges?: BitRange[]
): RSBasis {
  // Build cache key from allowed ranges
  const rangesKey = allowedBitRanges 
    ? allowedBitRanges.map(r => `${r.startBit}-${r.endBit}`).join(',')
    : 'all';
  const cacheKey = `${version}-${ecc}-${rangesKey}`;
  const cached = basisCache.get(cacheKey);
  if (cached) return cached;

  const blocks = getRSBlockInfo(version, ecc);
  const vectors: RSBasisVector[] = [];

  let globalBitOffset = 0;
  let totalDataBits = 0;
  let totalEccBits = 0;

  // Calculate total data bits first for capacity analysis
  for (const block of blocks) {
    totalDataBits += block.dataCount * 8;
    totalEccBits += block.eccCount * 8;
  }

  // Map allowed ranges to per-block allowed bits (handles interleaving!)
  let blockAllowedBits: Map<number, Set<number>> | undefined;
  let controllableBits: number;
  let protectionMode: 'semantic-ranges' | 'legacy-all';

  if (allowedBitRanges !== undefined && allowedBitRanges.length > 0) {
    // Strategy 2: Only specific bit ranges are allowed
    blockAllowedBits = mapAllowedRangesToBlocks(allowedBitRanges, version, ecc);
    
    // Count total allowed bits
    controllableBits = 0;
    for (const allowedSet of blockAllowedBits.values()) {
      controllableBits += allowedSet.size;
    }
    protectionMode = 'semantic-ranges';
    
    log.info('Building RS basis with SEMANTIC RANGE protection (Strategy 2)', {
      version,
      ecc,
      allowedRanges: allowedBitRanges.map(r => `${r.startBit}-${r.endBit}`),
      totalDataBits,
      controllableBits,
      controlPercentage: `${((controllableBits / totalDataBits) * 100).toFixed(1)}%`,
      numBlocks: blocks.length,
    });
  } else {
    // Legacy mode: all bits allowed (DANGEROUS!)
    controllableBits = totalDataBits;
    protectionMode = 'legacy-all';
    log.warn('Building RS basis in LEGACY MODE (all bits allowed). ' +
             'This WILL corrupt the decoded message! Pass allowedBitRanges for safe QR-Art.');
  }

  const controlPercentage = totalDataBits > 0 ? (controllableBits / totalDataBits) * 100 : 0;

  // Warn if control percentage is very low
  if (controllableBits <= 0) {
    log.warn('ZERO controllable bits! QR-Art cannot modify any pixels.', {
      suggestion: 'Use a larger QR version to create more padding codewords',
    });
  } else if (controlPercentage < 10) {
    log.warn('Very low controllable bit percentage. QR-Art effect will be minimal.', {
      controllableBits,
      controlPercentage: `${controlPercentage.toFixed(1)}%`,
      suggestion: 'Use a larger QR version for more padding codewords',
    });
  }

  let totalSkippedVectors = 0;
  globalBitOffset = 0; // Reset for actual vector building
  
  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
    const block = blocks[blockIdx];
    const allowedBitsForBlock = blockAllowedBits?.get(blockIdx);
    const maxPossibleVectors = block.dataCount * 8;
    const blockVectors = buildBlockBasis(block, blockIdx, globalBitOffset, allowedBitsForBlock);

    // Track how many vectors were skipped due to protection
    const skippedInBlock = maxPossibleVectors - blockVectors.length;
    totalSkippedVectors += skippedInBlock;

    vectors.push(...blockVectors);

    globalBitOffset += block.dataCount * 8;
  }

  const basis: RSBasis = {
    version,
    ecc,
    blocks,
    vectors,
    totalDataBits,
    totalEccBits,
  };

  log.info('Built full RS basis', {
    version,
    ecc,
    protectionMode,
    numBlocks: blocks.length,
    numVectors: vectors.length,
    totalDataBits,
    totalEccBits,
    skippedVectors: totalSkippedVectors,
    controllableVectors: vectors.length,
    expectedControllable: controllableBits,
  });

  basisCache.set(cacheKey, basis);
  return basis;
}

/**
 * Get cached basis or build new one
 * @deprecated Use buildFullBasis directly with dataLength for content protection
 */
export function getCachedBasis(version: number, ecc: ECCLevel): RSBasis {
  return buildFullBasis(version, ecc);
}

/**
 * Calculate the optimal suffix length for a given version to achieve target control percentage.
 * 
 * KEY INSIGHT: When we protect only the original data (not the suffix), the suffix bits
 * become controllable! So adding a suffix of N characters adds N*8 controllable bits.
 * 
 * The formula is:
 *   totalDataBits = capacity of QR version (depends on version and ECC)
 *   protectedBits = ceil((header + originalData*8 + terminator) / 8) * 8
 *   controllableBits = totalDataBits - protectedBits
 *   
 * With suffix:
 *   newTotalDataBits = capacity of (possibly larger) version
 *   protectedBits = UNCHANGED (we only protect original data)
 *   suffixBits = suffix.length * 8
 *   controllableBits = newTotalDataBits - protectedBits (includes suffix bits!)
 * 
 * @param version QR version (1-40), 0 for auto
 * @param ecc Error correction level
 * @param originalDataLength Length of original data (without suffix)
 * @param targetControlPercent Target control percentage (default: 50%)
 * @returns Recommended suffix length in characters
 */
export function getRecommendedSuffixLength(
  version: number,
  ecc: ECCLevel,
  originalDataLength: number,
  targetControlPercent: number = 50
): number {
  // Calculate protected bits (based on original data only)
  const headerBits = getHeaderBitCount(version > 0 ? version : 1);
  const originalContentBits = headerBits + originalDataLength * 8 + 4; // +4 for terminator
  const protectedBits = Math.ceil(originalContentBits / 8) * 8;
  
  // Get capacity of current version
  const blocks = getRSBlockInfo(version > 0 ? version : 1, ecc);
  const totalDataBits = blocks.reduce((sum, b) => sum + b.dataCount * 8, 0);
  
  // Calculate how many suffix bytes we need to achieve target control
  // Target: controllableBits / totalNewDataBits >= targetControlPercent
  // Where: controllableBits = totalNewDataBits - protectedBits
  // So: (totalNewDataBits - protectedBits) / totalNewDataBits >= target
  // totalNewDataBits - protectedBits >= target * totalNewDataBits
  // totalNewDataBits * (1 - target) >= protectedBits
  // totalNewDataBits >= protectedBits / (1 - target)
  
  const targetRatio = targetControlPercent / 100;
  const minTotalBits = protectedBits / (1 - targetRatio);
  
  // How many additional bits do we need?
  const additionalBitsNeeded = Math.max(0, minTotalBits - totalDataBits);
  
  // Each suffix character adds 8 bits
  // But we also need to account for the suffix in the QR capacity
  // For simplicity, calculate based on filling available capacity
  const availableForSuffix = totalDataBits - protectedBits;
  
  if (availableForSuffix >= (targetRatio * totalDataBits)) {
    // Current version has enough capacity - use all available padding
    return Math.floor(availableForSuffix / 8) - 1; // -1 for safety margin
  }
  
  // Need more capacity - this would require a larger version
  // Return a reasonable suffix length that will trigger version increase
  return Math.ceil(additionalBitsNeeded / 8);
}

/**
 * Calculate the optimal suffix length to fill the QR capacity for maximum control.
 * This is the "fill to capacity" approach - use all available space.
 * 
 * @param version QR version (1-40)
 * @param ecc Error correction level  
 * @param originalDataLength Length of original data (without suffix)
 * @returns Maximum suffix length that fits in the current version
 */
export function getMaxSuffixLength(
  version: number,
  ecc: ECCLevel,
  originalDataLength: number
): number {
  const blocks = getRSBlockInfo(version, ecc);
  const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
  
  // Total available bytes
  // Subtract: original data, header overhead (~2 bytes), terminator/padding (~1 byte)
  const headerOverhead = 2; // Mode (4 bits) + char count (8-16 bits)
  const terminatorOverhead = 1;
  const availableForSuffix = totalDataBytes - originalDataLength - headerOverhead - terminatorOverhead;
  
  return Math.max(0, availableForSuffix);
}

/**
 * Result of calculating optimal version and suffix for QR-Art
 */
export interface OptimalVersionAndSuffix {
  /** Recommended QR version */
  version: number;
  /** Recommended suffix length (characters) */
  suffixLength: number;
  /** Total data bytes capacity of this version */
  totalCapacity: number;
  /** Expected control percentage with this suffix */
  expectedControlPercent: number;
  /** Whether version was upgraded from minimum */
  versionUpgraded: boolean;
  /** Original minimum version that fits the data */
  originalVersion: number;
}

/**
 * Calculate the optimal QR version and suffix length to achieve a target control percentage.
 * 
 * This function will automatically upgrade to a larger QR version if the minimum version
 * doesn't provide enough capacity for meaningful QR-Art control.
 * 
 * IMPORTANT: This function always uses the FULL suffix capacity of the selected version.
 * The targetControlPercent is used as a MINIMUM THRESHOLD for version upgrade decisions,
 * not as a target to stop at. This ensures we maximize controllable bits.
 * 
 * The algorithm:
 * 1. Start with the minimum version that fits the data
 * 2. Calculate what control percentage we'd get with FULL suffix capacity at that version
 * 3. If below minimum threshold, upgrade to larger version and repeat
 * 4. Return the selected version with its FULL suffix capacity (not partial)
 * 
 * @param minVersion Minimum version (0 for auto, or user-specified minimum)
 * @param ecc Error correction level
 * @param dataLength Length of original data (without suffix)
 * @param minControlPercent Minimum control percentage required (default: 50%). Upgrade version if below this.
 * @returns Optimal version and suffix configuration (always uses FULL capacity)
 */
export function calculateOptimalVersionAndSuffix(
  minVersion: number,
  ecc: ECCLevel,
  dataLength: number,
  minControlPercent: number = 50
): OptimalVersionAndSuffix {
  // Find the minimum version that can fit the data
  let startVersion = minVersion > 0 ? minVersion : 1;
  
  // Find smallest version that fits the data
  for (let v = startVersion; v <= 40; v++) {
    const blocks = getRSBlockInfo(v, ecc);
    const capacity = blocks.reduce((sum, b) => sum + b.dataCount, 0);
    // Need space for: header (2-3 bytes) + data + terminator (1 byte)
    const headerOverhead = v <= 9 ? 2 : 3;
    if (capacity >= dataLength + headerOverhead + 1) {
      startVersion = v;
      break;
    }
  }
  
  const originalVersion = startVersion;
  
  // Calculate control percentage for each version from startVersion upward
  // We look for the first version that achieves minimum threshold, then use its FULL capacity
  // Cap at version 15 to avoid unnecessarily large QR codes (can go higher if needed)
  const maxVersionToTry = Math.min(40, Math.max(startVersion + 10, 15));
  
  let selectedVersion = startVersion;
  let selectedSuffixLength = 0;
  let selectedControlPercent = 0;
  let selectedCapacity = 0;
  
  // Track best option in case no version achieves threshold
  let bestVersion = startVersion;
  let bestSuffixLength = 0;
  let bestControlPercent = 0;
  let bestCapacity = 0;
  
  for (let version = startVersion; version <= maxVersionToTry; version++) {
    const blocks = getRSBlockInfo(version, ecc);
    const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
    const totalDataBits = totalDataBytes * 8;
    
    // Calculate MAXIMUM suffix for this version - we want to use ALL available capacity
    const headerOverhead = version <= 9 ? 2 : 3;
    const terminatorOverhead = 1;
    const maxSuffixLen = totalDataBytes - dataLength - headerOverhead - terminatorOverhead;
    
    if (maxSuffixLen <= 0) continue;
    
    // Calculate protected bits (original data only, not suffix)
    const headerBits = getHeaderBitCount(version);
    const contentBits = headerBits + dataLength * 8 + 4; // +4 for terminator
    const protectedBits = Math.ceil(contentBits / 8) * 8;
    
    // Controllable bits = total - protected (suffix bits are controllable!)
    const controllableBits = totalDataBits - protectedBits;
    const controlPercent = (controllableBits / totalDataBits) * 100;
    
    log.debug('Evaluating version for QR-Art (full capacity)', {
      version,
      totalDataBytes,
      maxSuffixLen,
      protectedBits,
      controllableBits,
      controlPercent: `${controlPercent.toFixed(1)}%`,
      meetsThreshold: controlPercent >= minControlPercent,
    });
    
    // Track the best option seen so far
    if (controlPercent > bestControlPercent) {
      bestVersion = version;
      bestSuffixLength = maxSuffixLen;
      bestControlPercent = controlPercent;
      bestCapacity = totalDataBytes;
    }
    
    // If this version meets minimum threshold, SELECT it with FULL capacity and stop
    // We want the SMALLEST version that meets threshold, with FULL suffix
    if (controlPercent >= minControlPercent && selectedVersion === startVersion) {
      selectedVersion = version;
      selectedSuffixLength = maxSuffixLen; // Use FULL capacity, not partial!
      selectedControlPercent = controlPercent;
      selectedCapacity = totalDataBytes;
      
      log.info('Selected version meets minimum control threshold', {
        version,
        controlPercent: `${controlPercent.toFixed(1)}%`,
        minThreshold: `${minControlPercent}%`,
        suffixLength: maxSuffixLen,
        totalCapacity: totalDataBytes,
      });
      break;
    }
  }
  
  // If no version met threshold, use the best one found (highest control %)
  if (selectedSuffixLength === 0) {
    selectedVersion = bestVersion;
    selectedSuffixLength = bestSuffixLength;
    selectedControlPercent = bestControlPercent;
    selectedCapacity = bestCapacity;
    
    log.warn('No version achieved minimum control threshold, using best available', {
      bestVersion,
      bestControlPercent: `${bestControlPercent.toFixed(1)}%`,
      minThreshold: `${minControlPercent}%`,
      suffixLength: bestSuffixLength,
    });
  }
  
  const versionUpgraded = selectedVersion > originalVersion;
  
  log.info('Calculated optimal version and suffix for QR-Art', {
    originalVersion,
    selectedVersion,
    versionUpgraded,
    suffixLength: selectedSuffixLength,
    expectedControlPercent: `${selectedControlPercent.toFixed(1)}%`,
    minControlPercent: `${minControlPercent}%`,
    thresholdAchieved: selectedControlPercent >= minControlPercent,
    totalCapacity: selectedCapacity,
    dataLength,
    ecc,
    capacityUsage: `${dataLength + selectedSuffixLength + 3}/${selectedCapacity} bytes`,
  });
  
  return {
    version: selectedVersion,
    suffixLength: selectedSuffixLength,
    totalCapacity: selectedCapacity,
    expectedControlPercent: selectedControlPercent,
    versionUpgraded,
    originalVersion,
  };
}

/**
 * Generate a random URL-safe suffix
 * This is useful for creating controllable characters that can be modified
 * 
 * @param length Number of characters
 * @returns Random suffix string
 */
export function generateRandomSuffix(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Find the optimal QR version for a given data length and target control percentage.
 * Returns the smallest version that can achieve the target control.
 * 
 * @param dataLength Length of the data to encode
 * @param ecc Error correction level
 * @param targetControlPercent Target control percentage (default: 50%)
 * @returns Optimal version number, or 40 if target cannot be achieved
 */
export function findOptimalVersion(
  dataLength: number,
  ecc: ECCLevel,
  targetControlPercent: number = 50
): number {
  const headerBits = 12; // Approximate for version 1-9 (4 + 8 bits)
  const contentBits = headerBits + dataLength * 8 + 4;
  const protectedBits = Math.ceil(contentBits / 8) * 8;
  
  // Target: controllable / total >= target%
  // So: total >= protected / (1 - target)
  const targetRatio = targetControlPercent / 100;
  const minTotalBits = protectedBits / (1 - targetRatio);
  const minTotalBytes = Math.ceil(minTotalBits / 8);
  
  // Find smallest version with enough capacity
  for (let version = 1; version <= 40; version++) {
    const blocks = getRSBlockInfo(version, ecc);
    const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
    
    if (totalDataBytes >= minTotalBytes + dataLength) {
      return version;
    }
  }
  
  return 40; // Max version if target cannot be achieved
}

/**
 * Clear the basis cache
 */
export function clearBasisCache(): void {
  basisCache.clear();
}

/**
 * XOR two basis vectors together
 * Result is also a valid RS codeword (linearity property)
 *
 * @param a First vector
 * @param b Second vector (must be same block)
 * @returns New vector that is XOR of both
 */
export function xorBasisVectors(a: RSBasisVector, b: RSBasisVector): RSBasisVector {
  if (a.rsBlockIndex !== b.rsBlockIndex) {
    throw new Error('Cannot XOR vectors from different RS blocks');
  }

  const blockBits = new Uint8Array(a.blockBits.length);
  for (let i = 0; i < blockBits.length; i++) {
    blockBits[i] = a.blockBits[i] ^ b.blockBits[i];
  }

  return {
    dataBitIndex: -1, // Combined vector doesn't have single data bit
    rsBlockIndex: a.rsBlockIndex,
    posInBlock: -1,
    bitInByte: -1,
    blockBits,
    affectedPixels: [...new Set([...a.affectedPixels, ...b.affectedPixels])],
    pivotPixel: -1,
  };
}

/**
 * Convert a basis to a binary matrix for Gauss-Jordan elimination
 * Rows are vectors, columns are bit positions
 *
 * @param vectors Basis vectors (from same RS block)
 * @param totalBits Total bits in a block (data + ECC)
 * @returns Binary matrix as 2D array of booleans
 */
export function basisToMatrix(vectors: RSBasisVector[], totalBits: number): boolean[][] {
  const matrix: boolean[][] = [];

  for (const v of vectors) {
    const row: boolean[] = [];
    for (let byteIdx = 0; byteIdx < v.blockBits.length; byteIdx++) {
      for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
        row.push((v.blockBits[byteIdx] & (1 << bitIdx)) !== 0);
      }
    }
    // Pad or truncate to totalBits
    while (row.length < totalBits) row.push(false);
    matrix.push(row.slice(0, totalBits));
  }

  return matrix;
}

/**
 * Convert a binary matrix row back to block bytes
 */
export function matrixRowToBytes(row: boolean[], byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  for (let byteIdx = 0; byteIdx < byteCount; byteIdx++) {
    let byte = 0;
    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const rowIdx = byteIdx * 8 + bitIdx;
      if (rowIdx < row.length && row[rowIdx]) {
        byte |= 1 << (7 - bitIdx);
      }
    }
    bytes[byteIdx] = byte;
  }
  return bytes;
}
