import { type ECCLevel, getRSBlockInfo } from './bit-mapping';
import { type BitRange, mapAllowedRangesToBlocks } from './semantic-layout';
import type { RSBasis, RSBasisVector } from './rs-basis.types';
import { basisCache } from './basis-cache';
import { log } from './log';
import { updateBasisCacheLru } from './update-basis-cache-lru';
import { buildBlockBasis } from './build-block-basis';

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
    ? allowedBitRanges.map((r) => `${r.startBit}-${r.endBit}`).join(',')
    : 'all';
  const cacheKey = `${version}-${ecc}-${rangesKey}`;
  const cached = basisCache.get(cacheKey);
  if (cached) {
    updateBasisCacheLru(cacheKey, cached);
    return cached;
  }

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
      allowedRanges: allowedBitRanges.map((r) => `${r.startBit}-${r.endBit}`),
      totalDataBits,
      controllableBits,
      controlPercentage: `${((controllableBits / totalDataBits) * 100).toFixed(1)}%`,
      numBlocks: blocks.length,
    });
  } else {
    // Legacy mode: all bits allowed (DANGEROUS!)
    controllableBits = totalDataBits;
    protectionMode = 'legacy-all';
    log.warn(
      'Building RS basis in LEGACY MODE (all bits allowed). ' +
        'This WILL corrupt the decoded message! Pass allowedBitRanges for safe QR-Art.'
    );
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

  updateBasisCacheLru(cacheKey, basis);
  return basis;
}
