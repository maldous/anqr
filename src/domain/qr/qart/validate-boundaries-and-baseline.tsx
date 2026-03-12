import type { ECCLevel } from './bit-mapping';
import { log } from './log';
import { encodeDataToBytes } from './encode-data-to-bytes';
import { verifyBaseMatrixScan } from './verify-base-matrix-scan';
import type { EncoderDerivedLayout } from './generate.types';

export function validateBoundariesAndBaseline(
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  actualSuffix: string,
  originalDataLength: number,
  protectedDataLength: number,
  baseMatrix: boolean[][],
  moduleCount: number,
  data: string,
  encodedDataLength: number,
  autoSuffix: boolean,
  suffix: string | undefined
): string | null {
  const internalConsistencyOk =
    encoderLayout.bitsAfterData >= encoderLayout.bitsAfterOriginalData &&
    encoderLayout.paddingSafeStartBit >= encoderLayout.suffixSafeEndBit &&
    encoderLayout.protectedBitEnd <= encoderLayout.suffixSafeStartBit &&
    encoderLayout.totalDataBytes > 0;

  log.info('BOUNDARY AUDIT (single source of truth: encoderLayout)', {
    version: actualVersion,
    stage: 'PRE_ELIMINATION',
    source: 'ENCODER_DERIVED_ONLY',
    modeUsedByEncoder: '8-bit byte',
    charCountBitsUsed: encoderLayout.bitsAfterCharCount - encoderLayout.bitsAfterMode,
    boundaries: {
      bitsAfterMode: encoderLayout.bitsAfterMode,
      bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
      bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
      bitsAfterFullData: encoderLayout.bitsAfterData,
      internalConsistencyOk,
    },
    protection: {
      protectedBitEnd: encoderLayout.protectedBitEnd,
      protectedByteEnd: Math.ceil(encoderLayout.protectedBitEnd / 8),
      protectedBytesCount: Math.ceil(encoderLayout.protectedBitEnd / 8),
      originalDataLength,
      protectedDataLength,
      hashCharProtected: actualSuffix.startsWith('#'),
    },
    twoIntervalRanges: {
      interval1_suffix: `bits ${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit} (${encoderLayout.suffixBits} bits)`,
      interval2_padding: `bits ${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit} (${encoderLayout.paddingBits} bits)`,
      gap_protected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits) [TERMINATOR + PAD-TO-BYTE]`,
    },
    controllable: {
      totalSuffixBits: encoderLayout.suffixBits,
      totalPaddingBits: encoderLayout.paddingBits,
      totalControllableBits: encoderLayout.suffixBits + encoderLayout.paddingBits,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

  if (!internalConsistencyOk) {
    log.warn('INTERNAL CONSISTENCY FAILURE - encoder boundary math is wrong!', {
      bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
      bitsAfterData: encoderLayout.bitsAfterData,
      bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
      originalDataLength,
      note: 'This is a bug in encodeDataToBytes()',
    });
    return 'Internal consistency failure: encoder boundary math incorrect';
  }

  log.info('ENCODER-DERIVED SEMANTIC LAYOUT (TWO-INTERVAL HYBRID STRATEGY)', {
    version: actualVersion,
    ecc,
    originalDataLength: encoderLayout.originalDataLength,
    suffixLength: encoderLayout.suffixLength,
    fullDataLength: encodedDataLength,
    encoderCheckpoints: {
      bitsAfterMode: encoderLayout.bitsAfterMode,
      bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
      bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
      bitsAfterData: `${encoderLayout.bitsAfterData} [SUFFIX END - TERMINATOR STARTS HERE]`,
      bitsAfterTerminator: encoderLayout.bitsAfterTerminator,
      bitsAfterPadToByte: encoderLayout.bitsAfterPadToByte,
    },
    paddingStartByte: encoderLayout.paddingStartByte,
    totalDataBytes: encoderLayout.totalDataBytes,
    paddingByteCount: encoderLayout.paddingByteCount,
    protection: {
      protectedRegion: `bits 0 - ${encoderLayout.protectedBitEnd} (mode + charCount + original data)`,
      protectedBytes: Math.ceil(encoderLayout.protectedBitEnd / 8),
    },
    twoIntervalSafeRanges: {
      interval1_suffix: `bits ${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit} (${encoderLayout.suffixBits} safe bits)`,
      interval2_padding: `bits ${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit} (${encoderLayout.paddingBits} safe bits)`,
      gap_protected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits) [TERMINATOR + PAD-TO-BYTE - NEVER MODIFY!]`,
    },
    controllable: {
      totalControllableBits: encoderLayout.suffixBits + encoderLayout.paddingBits,
      controllablePercent: `${(((encoderLayout.suffixBits + encoderLayout.paddingBits) / (encoderLayout.totalDataBytes * 8)) * 100).toFixed(1)}%`,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

  let baseDarkModules = 0;
  let totalModules = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      totalModules++;
      if (baseMatrix[row][col]) {
        baseDarkModules++;
      }
    }
  }
  const baseDarkPercent = (baseDarkModules / totalModules) * 100;

  log.info('BASELINE STATS (before QR-Art)', {
    version: actualVersion,
    moduleCount,
    totalModules,
    baseDarkModules,
    baseDarkPercent: `${baseDarkPercent.toFixed(1)}%`,
    suffixLength: actualSuffix.length,
    paddingBytes: encoderLayout.paddingByteCount,
    isDeterministicSuffix: autoSuffix && !suffix,
    note:
      baseDarkPercent > 60 || baseDarkPercent < 40
        ? 'Baseline is unbalanced - QR-Art may struggle'
        : 'Baseline is balanced',
  });

  const baseVerifyError = verifyBaseMatrixScan(baseMatrix, data, originalDataLength);
  return baseVerifyError;
}
