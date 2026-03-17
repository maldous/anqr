import type { ECCLevel } from "./bit-mapping";
import { buildFullBasis } from "./rs-basis";
import { log } from "./log";
import { validateBasisVectorSafety } from "./validate-basis-vector-safety";
import { runDeterministicMutationTest } from "./run-deterministic-mutation-test";
import { buildQArtFailResult } from "./build-q-art-fail-result";
import type { BasisValidationSuccess } from "./basis-validation-success";
import type { EncoderDerivedLayout } from "./generate.types";

export function buildAndValidateBasis(
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  blockDataCounts: number[],
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockEccCounts: number[],
  baseMatrix: boolean[][],
  moduleCount: number,
  actualMask: number,
  encodedData: string,
  data: string,
  actualSuffix: string,
  originalDataLength: number,
): BasisValidationSuccess {
  // Step 2: Build RS basis with TWO-INTERVAL RANGE protection (HYBRID STRATEGY)
  // =========================================================================
  // CRITICAL FIX: Use TWO separate byte-aligned intervals, NOT one continuous range!
  // =========================================================================
  // INTERVAL 1: Suffix BYTES only (excludes boundary byte with terminator)
  // INTERVAL 2: Padding codeword BYTES only (0xEC 0x11 pattern)
  // GAP: Terminator + pad-to-byte bits are PROTECTED (never modify!)
  //
  // This prevents the decoder from seeing fake mode indicators when terminator bits flip.
  const allowedBitRanges = encoderLayout.allowedBitRanges;

  log.info("TWO-INTERVAL SAFE RANGES for RS basis", {
    numIntervals: allowedBitRanges.length,
    interval1_suffix: allowedBitRanges[0]
      ? `bits ${allowedBitRanges[0].startBit} - ${allowedBitRanges[0].endBit}`
      : "NONE",
    interval2_padding: allowedBitRanges[1]
      ? `bits ${allowedBitRanges[1].startBit} - ${allowedBitRanges[1].endBit}`
      : "NONE (may be included in interval 1)",
    gap_protected: {
      startBit: encoderLayout.gapStartBit,
      endBit: encoderLayout.gapEndBit,
      bitCount: encoderLayout.gapBitCount,
      description: "TERMINATOR + PAD-TO-BYTE - NEVER MODIFY!",
    },
  });

  const basis = buildFullBasis(actualVersion, ecc, allowedBitRanges);

  const protectedBitEnd = encoderLayout.protectedBitEnd;
  const gapStartBit = encoderLayout.gapStartBit;
  const gapEndBit = encoderLayout.gapEndBit;

  const vectorsInProtectedRegion = validateBasisVectorSafety(
    basis.vectors,
    blockDataCounts,
    protectedBitEnd,
    gapStartBit,
    gapEndBit,
  );

  if (vectorsInProtectedRegion.length > 0) {
    const originalDataViolations = vectorsInProtectedRegion.filter(
      (v) => v.violationType === "ORIGINAL_DATA",
    );
    const terminatorViolations = vectorsInProtectedRegion.filter(
      (v) => v.violationType === "TERMINATOR_GAP",
    );

    log.warn("CRITICAL: Basis vectors exist in PROTECTED region or TERMINATOR GAP!", {
      protectedBitEnd,
      gapRange: `${gapStartBit} - ${gapEndBit}`,
      originalDataViolations: originalDataViolations.length,
      terminatorViolations: terminatorViolations.length,
      totalViolations: vectorsInProtectedRegion.length,
      sampleViolations: vectorsInProtectedRegion.slice(0, 10),
      note:
        originalDataViolations.length > 0
          ? "These vectors would corrupt original data!"
          : "These vectors would corrupt terminator bits (causing fake mode indicators)!",
    });

    // FAIL FAST - this is a fundamental bug in allowed range calculation
    const _failResult = buildQArtFailResult(
      `${vectorsInProtectedRegion.length} basis vectors touch protected/gap bits - algorithm bug`,
      baseMatrix,
      moduleCount,
      actualVersion,
      actualMask,
      encodedData,
      data,
      actualSuffix,
    );
    return {
      earlyReturn: _failResult,
      basis,
      actualControllableBits: 0,
      actualControlPercentage: 0,
      allowedBitRanges,
    };
  }

  log.info(
    "GUARD PASSED: All basis vectors are in allowed regions (suffix bytes OR padding bytes)",
    {
      protectedBitEnd,
      gapRange: `${gapStartBit} - ${gapEndBit} (${encoderLayout.gapBitCount} bits protected)`,
      suffixSafeRange: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      paddingSafeRange: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      vectorCount: basis.vectors.length,
      numIntervals: encoderLayout.allowedBitRanges.length,
      stage: "POST_BASIS_BUILD",
    },
  );

  // Calculate actual controllable bits
  const actualControllableBits = basis.vectors.length;
  const totalDataBits = encoderLayout.totalDataBytes * 8;
  const actualControlPercentage =
    totalDataBits > 0 ? (actualControllableBits / totalDataBits) * 100 : 0;
  const expectedControllableBits = encoderLayout.suffixBits + encoderLayout.paddingBits;

  log.info("QR-Art capacity analysis (TWO-INTERVAL HYBRID STRATEGY)", {
    totalDataBits,
    protectedBits: encoderLayout.protectedBitEnd,
    protectedContent: `mode + charCount + original data (${encoderLayout.originalDataLength} chars)`,
    twoIntervalRanges: {
      interval1_suffix: `${encoderLayout.suffixBits} bits (bytes ${Math.floor(encoderLayout.suffixSafeStartBit / 8)} - ${Math.floor(encoderLayout.suffixSafeEndBit / 8)})`,
      interval2_padding: `${encoderLayout.paddingBits} bits (bytes ${Math.floor(encoderLayout.paddingSafeStartBit / 8)} - ${Math.floor(encoderLayout.paddingSafeEndBit / 8)})`,
      gap_protected: `${encoderLayout.gapBitCount} bits (terminator + pad-to-byte)`,
    },
    controllable: {
      totalControllable: actualControllableBits,
      expectedControllable: expectedControllableBits,
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
    vectorsCreated: basis.vectors.length,
    source: "ENCODER_DERIVED_TWO_INTERVAL",
  });

  // Warn if control is very limited
  if (basis.vectors.length === 0) {
    log.warn("ZERO controllable vectors! QR-Art cannot modify any pixels.", {
      suggestion: "Use a larger QR version or add a longer suffix.",
      suffixLength: actualSuffix.length,
      paddingBytes: encoderLayout.paddingByteCount,
      originalDataLength,
    });

    // Return the base matrix unchanged - it's a valid QR but without art
    return {
      earlyReturn: {
        success: true,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      },
      basis,
      actualControllableBits: 0,
      actualControlPercentage: 0,
      allowedBitRanges,
    };
  } else if (actualControlPercentage < 20) {
    log.warn("Limited QR-Art control. Image quality may be reduced.", {
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      controllableVectors: basis.vectors.length,
      suffixBits: encoderLayout.suffixBits,
      paddingBits: encoderLayout.paddingBits,
      suggestion: "Use a larger QR version or enable autoSuffix for better control.",
    });
  }

  // =========================================================================
  if (basis.vectors.length > 0) {
    log.info("Running deterministic HYBRID mutation test...");
    const mutationTestResult = runDeterministicMutationTest(
      basis.vectors[0],
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      encoderLayout,
      actualVersion,
      ecc,
      actualMask,
      data,
      originalDataLength,
      actualSuffix,
    );

    if (!mutationTestResult.passed) {
      const _failResult = buildQArtFailResult(
        mutationTestResult.error ?? "HYBRID mutation test failed",
        baseMatrix,
        moduleCount,
        actualVersion,
        actualMask,
        encodedData,
        data,
        actualSuffix,
      );
      return {
        earlyReturn: _failResult,
        basis,
        actualControllableBits: 0,
        actualControlPercentage: 0,
        allowedBitRanges,
      };
    }
  }

  return {
    basis,
    actualControllableBits,
    actualControlPercentage,
    allowedBitRanges,
  };
}
