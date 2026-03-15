import { type ECCLevel, getRSBlockInfo } from './bit-mapping';
import type { QRArtCapacityInfo } from './rs-basis.types';
import { getHeaderBitCount } from './get-header-bit-count';
import { calculateProtectedBitsPerBlock } from './calculate-protected-bits-per-block';

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
