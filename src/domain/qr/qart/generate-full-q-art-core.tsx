import { buildBitPixelMap, getDataPixelIndices } from './bit-mapping';
import { applyAllSelectedVectors, countMatchingPixels } from './elimination';
import { mapImageToTargetsSupersampled } from './image-utils';
import { log } from './log';
import { scanMatrixWithJsQR } from './scan-matrix-with-js-qr';
import { generateBaseQR } from './generate-base-qr';
import { regenerateQRFromModifiedData } from './regenerate-qr-from-modified-data';
import { buildQArtFailResult } from './build-q-art-fail-result';
import { logBlockModificationSummary } from './log-block-modification-summary';
import { validateFinalMatrixDiagnostics } from './validate-final-matrix-diagnostics';
import { performSemanticGateAndFallback } from './perform-semantic-gate-and-fallback';
import { countFinalMatchingPixels } from './count-final-matching-pixels';
import { performZeroModificationTest } from './perform-zero-modification-test';
import { validateBoundariesAndBaseline } from './validate-boundaries-and-baseline';
import { verifyModifiedDataIntegrity } from './verify-modified-data-integrity';
import { buildAndValidateBasis } from './build-and-validate-basis';
import { selectAndFilterVectors } from './select-and-filter-vectors';
import type { QArtCoreParams } from './q-art-core-params';
import type { FullQArtResult } from './generate.types';

export async function generateFullQArtCore(params: QArtCoreParams): Promise<FullQArtResult> {
  const {
    data,
    targetImage,
    ecc,
    maskPattern,
    onProgress,
    performanceSettings,
    performanceProfile,
    resolvedSuffixMode,
    encodingSuffixMode,
    encodedData,
    actualSuffix,
    originalData,
    originalDataLength,
    versionToUse,
    strictSuffix,
    autoSuffix,
    suffix,
  } = params;

  onProgress?.('Encoding base data', 0);

  // Step 1: Generate base QR to determine version, get initial matrix, and extract per-block data/ECC
  // HYBRID MODE: Pass protectedDataLength to track protection boundaries
  // CRITICAL: When using byte-mode suffix with a leading '#', protect the separator.
  // In numeric mode, the prefix already includes '#', so originalDataLength is correct.
  const protectedDataLength =
    resolvedSuffixMode === 'byte' && actualSuffix.startsWith('#')
      ? originalDataLength + 1
      : originalDataLength;

  const baseResult = generateBaseQR(
    encodedData,
    versionToUse,
    ecc,
    maskPattern,
    protectedDataLength,
    encodingSuffixMode
  );

  // FAIL FAST: If base matrix generation failed (e.g., ECC/mask mismatch), return error immediately
  if (!baseResult.success) {
    log.warn('BASE QR GENERATION FAILED - FAIL FAST!', {
      error: baseResult.error,
      rejectionReason: baseResult.rejectionReason,
      errorDetails: baseResult.errorDetails,
      note: 'This indicates a critical bug in the QR encoder or regeneration pipeline',
    });

    return {
      success: false,
      error: baseResult.error ?? 'Base QR generation failed with unknown error',
      matrix: baseResult.matrix,
      moduleCount: baseResult.matrix.length,
      version: baseResult.actualVersion,
      maskPattern: baseResult.actualMask,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: encodedData,
      originalData: data,
      suffix: actualSuffix,
    };
  }

  const {
    matrix: baseMatrix,
    actualVersion,
    actualMask,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    encoderLayout,
  } = baseResult;
  const moduleCount = baseMatrix.length;

  log.info('Base QR generated', {
    version: actualVersion,
    moduleCount,
    maskPattern: actualMask,
    ecc,
    dataLength: data.length,
  });

  // Step 1.5: Validate boundaries, compute baseline stats, verify base matrix
  onProgress?.('Analyzing semantic layout', 5);

  const boundaryError = validateBoundariesAndBaseline(
    encoderLayout,
    actualVersion,
    ecc,
    actualSuffix,
    originalDataLength,
    protectedDataLength,
    baseMatrix,
    moduleCount,
    data,
    encodedData.length,
    autoSuffix,
    suffix
  );
  if (boundaryError) {
    return buildQArtFailResult(
      boundaryError,
      baseMatrix,
      moduleCount,
      actualVersion,
      actualMask,
      encodedData,
      data,
      actualSuffix
    );
  }

  onProgress?.('Building RS basis', 10);

  const basisResult = buildAndValidateBasis(
    encoderLayout,
    actualVersion,
    ecc,
    blockDataCounts,
    blockDataArrays,
    blockEccArrays,
    blockEccCounts,
    baseMatrix,
    moduleCount,
    actualMask,
    encodedData,
    data,
    actualSuffix,
    originalDataLength
  );
  if (basisResult.earlyReturn) {
    return basisResult.earlyReturn;
  }
  const { basis, actualControlPercentage, allowedBitRanges } = basisResult;

  onProgress?.('Mapping bits to pixels', 20);

  // Step 3: Build bit-to-pixel mapping
  const mappings = buildBitPixelMap(actualVersion, ecc, actualMask);

  log.debug('Bit-pixel mapping built', {
    totalMappings: mappings.length,
  });

  onProgress?.('Processing target image', 30);

  // Step 4: Map target image to module targets
  const { targets, importance } = mapImageToTargetsSupersampled(targetImage, moduleCount, 128, {
    supersampleLevel: performanceSettings.supersampleLevel,
    cleanupSpeckles: true,
    maxDarkSpeckleArea: performanceSettings.maxDarkSpeckleArea,
    maxLightHoleArea: performanceSettings.maxLightHoleArea,
  });

  // Get set of data pixels
  const dataPixelIndices = getDataPixelIndices(actualVersion);
  const dataPixels = new Set(dataPixelIndices);

  onProgress?.('Ranking pixels by importance', 40);

  onProgress?.('Performing Gauss-Jordan elimination', 50);

  onProgress?.('Selecting basis vectors', 70);

  const selectionResult = selectAndFilterVectors(
    basis,
    mappings,
    targets,
    importance,
    baseMatrix,
    moduleCount,
    dataPixelIndices,
    dataPixels,
    performanceSettings,
    performanceProfile,
    resolvedSuffixMode,
    strictSuffix,
    blockDataArrays,
    blockDataCounts,
    encoderLayout,
    actualVersion,
    actualMask
  );
  const { blockSelections, flattenedSelections, totalSelected, elimination } = selectionResult;
  const _orderedSelections = flattenedSelections;

  onProgress?.('Counting predicted matches', 75);

  // Step 8: Count predicted matching pixels (before re-encoding)
  // Pass mappings so we can accurately track ALL pixels affected by selected vectors
  const { matching: predictedMatching, total } = countMatchingPixels(
    baseMatrix,
    elimination,
    blockSelections,
    targets,
    moduleCount,
    dataPixels,
    mappings
  );

  const predictedMatchPercentage = total > 0 ? (predictedMatching / total) * 100 : 0;

  log.info('Predicted QR-Art result', {
    predictedMatchingPixels: predictedMatching,
    totalControllable: total,
    predictedMatchPercentage: `${predictedMatchPercentage.toFixed(1)}%`,
  });

  onProgress?.('Modifying data bytes', 80);

  // Step 9: Apply vectors and verify integrity (RS linearity, ECC damage, protected bytes)
  const modifiedBlockData = blockDataArrays.map((arr) => new Uint8Array(arr));
  const modifiedBlockEcc = blockEccArrays.map((arr) => new Uint8Array(arr));
  applyAllSelectedVectors(
    modifiedBlockData,
    modifiedBlockEcc,
    elimination,
    blockSelections,
    blockDataCounts
  );

  const integrityError = verifyModifiedDataIntegrity(
    blockDataArrays,
    blockEccArrays,
    modifiedBlockData,
    modifiedBlockEcc,
    blockEccCounts,
    allowedBitRanges,
    encoderLayout,
    actualVersion,
    ecc,
    totalSelected
  );
  if (integrityError) {
    return buildQArtFailResult(
      integrityError,
      baseMatrix,
      moduleCount,
      actualVersion,
      actualMask,
      encodedData,
      data,
      actualSuffix
    );
  }

  onProgress?.('Re-encoding QR code', 85);

  // Zero-modification test - verify that regenerating with UNMODIFIED data still scans
  performZeroModificationTest(
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask,
    encodedData
  );

  // Log modification summary per block
  logBlockModificationSummary(blockDataArrays, modifiedBlockData, blockEccArrays, modifiedBlockEcc);

  // Step 10: Regenerate QR with modified data AND ECC to get a valid, scannable code
  // We pass the pre-XORed ECC - do NOT recompute it (that would break RS linearity)
  const finalMatrix = regenerateQRFromModifiedData(
    modifiedBlockData,
    modifiedBlockEcc,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask
  );

  // Diagnostic: Check format info, matrix diff, finder/timing patterns, format info comparison
  const diagnostics = validateFinalMatrixDiagnostics(
    finalMatrix,
    baseMatrix,
    ecc,
    actualMask,
    moduleCount
  );

  // Scan the final matrix to verify it's actually scannable
  const scanResult = scanMatrixWithJsQR(finalMatrix);

  // Semantic-hard-gate validation + fallback if needed
  const { finalMatrixToUse, actualVectorsApplied } = performSemanticGateAndFallback(
    finalMatrix,
    baseMatrix,
    originalData,
    data,
    encodedData,
    ecc,
    actualMask,
    actualSuffix,
    strictSuffix,
    resolvedSuffixMode,
    originalDataLength,
    scanResult,
    blockSelections,
    elimination,
    importance,
    moduleCount,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    totalSelected,
    diagnostics,
    actualControlPercentage,
    basis.vectors.length
  );

  // Also scan the base matrix to confirm it was valid
  const baseScanResult = scanMatrixWithJsQR(baseMatrix);
  log.debug('Base matrix scan check', {
    success: baseScanResult.success,
    data: baseScanResult.data,
    error: baseScanResult.error,
    scanAttempts: baseScanResult.attempts,
  });

  onProgress?.('Validating result', 95);

  // Step 11: Count actual matching pixels in the final matrix
  // Use finalMatrixToUse which may have been updated by binary search fallback
  const matching = countFinalMatchingPixels(finalMatrixToUse, targets, dataPixels, moduleCount);

  const matchPercentage = total > 0 ? (matching / total) * 100 : 0;

  // Get final scan result for segment info
  const finalScan = scanMatrixWithJsQR(finalMatrixToUse);

  log.info('QR-Art generation complete (SEMANTIC-HARD-GATE TWO-INTERVAL HYBRID)', {
    success: true,
    matchingPixels: matching,
    totalControllable: total,
    matchPercentage: `${matchPercentage.toFixed(1)}%`,
    vectorsApplied: actualVectorsApplied,
    usedBinarySearchFallback: actualVectorsApplied < totalSelected,
    originalDataLength,
    suffixLength: actualSuffix.length,
    controllablePercent: `${actualControlPercentage.toFixed(1)}%`,
    strictSuffix,
    semanticValidation: {
      eccInvariantLocked: true,
      maskInvariantLocked: true,
      byteExactPrefixMatch: true,
      formatInfoVerified: true,
      structuralValidityChecked: true,
      suffixCharsetMode: strictSuffix ? 'STRICT' : 'RELAXED',
      ecc,
      mask: actualMask,
    },
    structuralInfo: {
      structurallyValid: finalScan.structurallyValid,
      segmentCount: finalScan.segmentCount,
      segmentModes: finalScan.segments?.map((s) => s.modeName),
    },
    twoIntervalStrategy: {
      suffixSafeBits: encoderLayout.suffixBits,
      paddingSafeBits: encoderLayout.paddingBits,
      gapProtectedBits: encoderLayout.gapBitCount,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

  onProgress?.('Complete', 100);

  return {
    success: true,
    matrix: finalMatrixToUse,
    moduleCount,
    version: actualVersion,
    maskPattern: actualMask,
    matchingPixels: matching,
    totalControllable: total,
    matchPercentage,
    encodedData: encodedData,
    originalData: data,
    suffix: actualSuffix,
  };
}
