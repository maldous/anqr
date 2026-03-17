import type { ECCLevel } from "./bit-mapping";
import { validateOriginalDataPreserved } from "./validate-original-data-preserved";
import { log } from "./log";
import { computeLinearBitPosition } from "./compute-linear-bit-position";
import { classifyIntervalStatus } from "./classify-interval-status";
import { applyTestVectorAndScan } from "./apply-test-vector-and-scan";
import type { EncoderDerivedLayout } from "./generate.types";

export function runDeterministicMutationTest(
  testVector: {
    rsBlockIndex: number;
    posInBlock: number;
    bitInByte: number;
    dataBitIndex: number;
    blockBits: Uint8Array;
  },
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
  data: string,
  originalDataLength: number,
  actualSuffix: string,
): { passed: boolean; error?: string } {
  const testLocalBitIndex = testVector.posInBlock * 8 + (7 - testVector.bitInByte);
  const { linearByte, linearBit } = computeLinearBitPosition(
    testVector.rsBlockIndex,
    testVector.posInBlock,
    testVector.bitInByte,
    blockDataCounts,
  );
  const interval = classifyIntervalStatus(linearBit, encoderLayout);

  log.info("Test vector details (TWO-INTERVAL)", {
    vectorDataBitIndex: testVector.dataBitIndex,
    vectorBlockIndex: testVector.rsBlockIndex,
    vectorPosInBlock: testVector.posInBlock,
    vectorBitInByte: testVector.bitInByte,
    localBitIndex: testLocalBitIndex,
    linearByte,
    linearBit,
    twoIntervalAnalysis: {
      ...interval,
      suffixRange: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      paddingRange: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      gapRange: `${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit}`,
    },
    status: interval.status,
  });

  const testScan = applyTestVectorAndScan(
    testVector,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask,
  );

  if (!testScan.success) {
    log.warn("HYBRID MUTATION TEST FAILED - single vector breaks scan!", {
      vectorDataBitIndex: testVector.dataBitIndex,
      vectorBlockIndex: testVector.rsBlockIndex,
      localBitIndex: testLocalBitIndex,
      linearByte,
      linearBit,
      paddingStartByte: encoderLayout.paddingStartByte,
      allowedBitStart: encoderLayout.allowedBitStart,
      scanError: testScan.error,
    });
    return {
      passed: false,
      error: "HYBRID mutation test failed: single vector application broke QR scan",
    };
  }

  const mutationValidation = validateOriginalDataPreserved(testScan.data, data);
  if (!mutationValidation.valid) {
    log.warn("HYBRID MUTATION TEST FAILED - byte-exact validation failed!", {
      expectedOriginal: data,
      actualData: testScan.data,
      expectedLength: originalDataLength,
      actualLength: testScan.data?.length,
      validationReason: mutationValidation.reason,
      mismatchDetails: mutationValidation.mismatch,
      localBitIndex: testLocalBitIndex,
      linearByte,
      linearBit,
      protectedBitEnd: encoderLayout.protectedBitEnd,
    });
    return { passed: false, error: `HYBRID mutation test failed: ${mutationValidation.reason}` };
  }

  const decodedSuffix = testScan.data?.slice(originalDataLength) || "";
  log.info("HYBRID MUTATION TEST PASSED (TWO-INTERVAL byte-exact)", {
    vectorDataBitIndex: testVector.dataBitIndex,
    vectorBlockIndex: testVector.rsBlockIndex,
    localBitIndex: testLocalBitIndex,
    linearByte,
    linearBit,
    vectorInterval: (() => {
      if (interval.isInSuffixInterval) return "SUFFIX";
      if (interval.isInPaddingInterval) return "PADDING";
      return "UNKNOWN";
    })(),
    gapProtected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits)`,
    originalDataPreserved: true,
    validationMethod: "BYTE_EXACT_PREFIX",
    suffixWasModified: decodedSuffix !== actualSuffix,
    matrixScansCorrectly: true,
  });

  return { passed: true };
}
