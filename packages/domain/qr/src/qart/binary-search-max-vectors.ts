import type { EliminationResult } from "./elimination";
import { type ECCLevel } from "./validation";
import type { FlattenedSelection, BinarySearchResult } from "./scan-fallback.types";
import { createRejectionHistogram } from "./create-rejection-histogram";
import { log } from "./log";
import { logSearchIteration } from "./log-search-iteration";
import type { RegenerateQrFn } from "./regenerate-qr-fn.types";
import { trackRejection } from "./track-rejection";
import { validateBaseMatrix } from "./validate-base-matrix";
import { validateCandidate } from "./validate-candidate";
import { applySubsetAndRegenerate } from "./apply-subset-and-regenerate";

export function binarySearchMaxVectors(
  flattened: FlattenedSelection[],
  originalBlockData: Uint8Array[],
  originalBlockEcc: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  eliminationResult: EliminationResult,
  regenerateQRFn: RegenerateQrFn,
  scanQRFn: (matrix: boolean[][]) => { success: boolean; data?: string },
  expectedData: string,
  expectedEcc?: ECCLevel,
  expectedMask?: number,
  strictSuffix: boolean = false,
): BinarySearchResult {
  const totalVectors = flattened.length;
  const rejectionHistogram = createRejectionHistogram();

  log.info("Starting binary search for maximum scannable vectors", {
    totalVectors,
    expectedDataLength: expectedData.length,
    expectedDataPreview:
      expectedData.length > 50 ? `${expectedData.slice(0, 50)}...` : expectedData,
    formatVerificationEnabled: expectedEcc !== undefined && expectedMask !== undefined,
    expectedEcc,
    expectedMask,
    strictSuffix,
    note: strictSuffix
      ? "SEMANTIC-HARD-GATE: prefix match + format info + strict suffix charset"
      : "SEMANTIC-HARD-GATE: prefix match + format info (suffix charset is SOFT PENALTY)",
  });

  if (totalVectors === 0) {
    const { matrix, modifiedBlockData, modifiedBlockEcc } = applySubsetAndRegenerate(
      flattened,
      0,
      originalBlockData,
      originalBlockEcc,
      blockDataCounts,
      blockEccCounts,
      eliminationResult,
      regenerateQRFn,
    );
    return { maxCount: 0, matrix, modifiedBlockData, modifiedBlockEcc, iterations: 0 };
  }

  const base = validateBaseMatrix(
    flattened,
    originalBlockData,
    originalBlockEcc,
    blockDataCounts,
    blockEccCounts,
    eliminationResult,
    regenerateQRFn,
    scanQRFn,
    expectedData,
    expectedEcc,
    expectedMask,
    strictSuffix,
    rejectionHistogram,
  );

  if (!base.valid) {
    return {
      maxCount: 0,
      matrix: base.result.matrix,
      modifiedBlockData: base.result.modifiedBlockData,
      modifiedBlockEcc: base.result.modifiedBlockEcc,
      iterations: 1,
    };
  }

  let low = 0;
  let high = totalVectors;
  let bestCount = 0;
  let bestMatrix = base.result.matrix;
  let bestBlockData = base.result.modifiedBlockData;
  let bestBlockEcc = base.result.modifiedBlockEcc;
  let iterations = 0;

  while (low <= high) {
    iterations++;
    const mid = Math.floor((low + high) / 2);

    const result = applySubsetAndRegenerate(
      flattened,
      mid,
      originalBlockData,
      originalBlockEcc,
      blockDataCounts,
      blockEccCounts,
      eliminationResult,
      regenerateQRFn,
    );

    const scan = scanQRFn(result.matrix);
    const candidateResult = validateCandidate(
      scan,
      result.matrix,
      expectedData,
      expectedEcc,
      expectedMask,
      strictSuffix,
    );
    const { isValid, validation, formatVerification } = candidateResult;

    trackRejection(rejectionHistogram, isValid, validation);
    logSearchIteration(
      iterations,
      mid,
      low,
      high,
      isValid,
      validation,
      scan,
      formatVerification,
      expectedData,
    );

    if (isValid) {
      bestCount = mid;
      bestMatrix = result.matrix;
      bestBlockData = result.modifiedBlockData;
      bestBlockEcc = result.modifiedBlockEcc;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  log.info("Binary search complete", {
    maxCount: bestCount,
    totalVectors,
    percentageUsed: `${((bestCount / totalVectors) * 100).toFixed(1)}%`,
    iterations,
    strictSuffix,
    rejectionHistogram: {
      ...rejectionHistogram,
      acceptanceRate:
        rejectionHistogram.total > 0
          ? `${((rejectionHistogram.ACCEPTED / rejectionHistogram.total) * 100).toFixed(1)}%`
          : "N/A",
    },
  });

  if (strictSuffix && rejectionHistogram.SUFFIX_CHARSET_INVALID > rejectionHistogram.ACCEPTED) {
    log.warn("High suffix charset rejection rate with strictSuffix=true", {
      suffixCharsetRejections: rejectionHistogram.SUFFIX_CHARSET_INVALID,
      accepted: rejectionHistogram.ACCEPTED,
      suggestion: "Consider setting strictSuffix=false to allow more candidates",
    });
  }

  return {
    maxCount: bestCount,
    matrix: bestMatrix,
    modifiedBlockData: bestBlockData,
    modifiedBlockEcc: bestBlockEcc,
    iterations,
  };
}
