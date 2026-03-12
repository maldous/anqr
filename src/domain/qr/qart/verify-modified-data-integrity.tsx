import type { ECCLevel } from './bit-mapping';
import { type BitRange, mapAllowedRangesToBlocks } from './semantic-layout';
import { log } from './log-2';
import { verifyProtectedBytes } from './verify-protected-bytes';
import { estimateBlockECCDamage } from './estimate-block-ecc-damage';
import { verifyRSLinearityAllBlocks } from './verify-rs-linearity-all-blocks';
import type { EncoderDerivedLayout } from './generate.types';

export function verifyModifiedDataIntegrity(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  modifiedBlockEcc: Uint8Array[],
  blockEccCounts: number[],
  allowedBitRanges: BitRange[],
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  totalSelected: number
): string | null {
  const rsLinearityOk = verifyRSLinearityAllBlocks(
    modifiedBlockData,
    modifiedBlockEcc,
    blockEccCounts
  );
  if (!rsLinearityOk) {
    return 'RS linearity broken - modified codewords are invalid';
  }

  const { anyBlockOverBudget } = estimateBlockECCDamage(
    blockDataArrays,
    modifiedBlockData,
    blockEccCounts
  );

  if (anyBlockOverBudget) {
    log.warn('ECC budget exceeded in one or more blocks - falling back to binary search', {
      suggestion: 'Reduce number of vectors or use higher ECC level',
      note: 'Binary search fallback will find maximum safe vector count',
    });
  }

  log.info('BOUNDARY AUDIT (single source of truth: encoderLayout)', {
    version: actualVersion,
    stage: 'PRE_SCAN',
    source: 'ENCODER_DERIVED_TWO_INTERVAL',
    protection: {
      protectedBitEnd: encoderLayout.protectedBitEnd,
      protectedByteEnd: Math.ceil(encoderLayout.protectedBitEnd / 8),
      originalDataLength: encoderLayout.originalDataLength,
    },
    twoIntervalRanges: {
      interval1_suffix: `bits ${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      interval2_padding: `bits ${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      gap_protected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits)`,
    },
    controllable: {
      vectorsApplied: totalSelected,
      anyBlockOverBudget,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

  const blockAllowedBits = mapAllowedRangesToBlocks(allowedBitRanges, actualVersion, ecc);

  const protectedCheck = verifyProtectedBytes(blockDataArrays, modifiedBlockData, blockAllowedBits);

  if (!protectedCheck.valid) {
    log.warn('PROTECTED BYTES MODIFIED - HYBRID protection violation!', {
      violationCount: protectedCheck.violations.length,
      violations: protectedCheck.violations.slice(0, 10),
      protectedBitEnd: encoderLayout.protectedBitEnd,
      originalDataLength: encoderLayout.originalDataLength,
      note: 'Vectors modified original data bytes - algorithm bug!',
    });
    log.warn('FAILING FAST - returning base matrix due to protected byte violation');
    return `Protected byte violation: ${protectedCheck.violations.length} original data bytes were modified`;
  }

  log.info('HYBRID protection validation PASSED (TWO-INTERVAL encoder-derived)', {
    protectedBitRange: `0 - ${encoderLayout.protectedBitEnd} (mode + charCount + original data)`,
    twoIntervalRanges: {
      interval1_suffix: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      interval2_padding: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      gap_protected: `${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (terminator + pad-to-byte)`,
    },
    originalDataLength: encoderLayout.originalDataLength,
    suffixLength: encoderLayout.suffixLength,
    totalVectorsApplied: totalSelected,
    protectedBytesChecked: 'all blocks verified (including terminator gap)',
  });

  return null;
}
