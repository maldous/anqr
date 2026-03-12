import type { ECCLevel } from './bit-mapping';
import type { BlockSelectionResult, EliminationResult } from './elimination';
import { binarySearchMaxVectors, flattenAndOrderSelections } from './scan-fallback';
import { performSemanticValidation } from './perform-semantic-validation';
import { log } from './log-2';
import { scanMatrixWithJsQR } from './scan-matrix-with-js-qr';
import { regenerateQRFromModifiedData } from './regenerate-qr-from-modified-data';
import type { ScanResult } from './scan-result';

export function handleScanFailureFallback(
  blockSelections: BlockSelectionResult[],
  elimination: EliminationResult,
  importance: number[][],
  moduleCount: number,
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
  data: string,
  actualSuffix: string,
  strictSuffix: boolean,
  totalSelected: number,
  baseMatrix: boolean[][]
): { matrix: boolean[][]; vectorsApplied: number; scanResult: ScanResult } {
  log.info('Attempting binary search fallback to find scannable configuration');

  const flattenedSelections = flattenAndOrderSelections(
    blockSelections,
    elimination,
    importance,
    moduleCount
  );

  const regenerateFn = (
    blockData: Uint8Array[],
    blockEcc: Uint8Array[],
    dataCounts: number[],
    eccCounts: number[]
  ) =>
    regenerateQRFromModifiedData(
      blockData,
      blockEcc,
      dataCounts,
      eccCounts,
      actualVersion,
      ecc,
      actualMask
    );

  const binarySearchResult = binarySearchMaxVectors(
    flattenedSelections,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    elimination,
    regenerateFn,
    scanMatrixWithJsQR,
    data,
    ecc,
    actualMask,
    strictSuffix
  );

  if (binarySearchResult.maxCount > 0) {
    log.info('Binary search fallback successful', {
      originalVectors: totalSelected,
      usableVectors: binarySearchResult.maxCount,
      reductionPercent: `${((1 - binarySearchResult.maxCount / totalSelected) * 100).toFixed(1)}%`,
      iterations: binarySearchResult.iterations,
    });

    const resultMatrix = binarySearchResult.matrix;
    const vectorsApplied = binarySearchResult.maxCount;

    const postSearchValidation = performSemanticValidation(
      resultMatrix,
      data,
      ecc,
      actualMask,
      actualSuffix,
      scanMatrixWithJsQR,
      strictSuffix
    );

    if (postSearchValidation.valid) {
      const postSearchScan = scanMatrixWithJsQR(resultMatrix);
      log.info('Binary search result SEMANTIC-HARD-GATE validation PASSED', {
        originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
        ecc,
        mask: actualMask,
        structurallyValid: postSearchScan.structurallyValid,
        segmentCount: postSearchScan.segmentCount,
        segmentModes: postSearchScan.segments?.map((s) => s.modeName),
        validationMethod: 'SEMANTIC_HARD_GATE',
      });
      return { matrix: resultMatrix, vectorsApplied, scanResult: postSearchScan };
    } else {
      const postSearchScan = scanMatrixWithJsQR(resultMatrix);
      log.warn('Binary search result SEMANTIC-HARD-GATE validation FAILED!', {
        rejectionReason: postSearchValidation.reason,
        description: postSearchValidation.description,
        details: postSearchValidation.details,
        expectedOriginal: data,
        structurallyValid: postSearchScan.structurallyValid,
        segmentCount: postSearchScan.segmentCount,
        segmentModes: postSearchScan.segments?.map((s) => s.modeName),
        segments: postSearchScan.segments?.map((s) => ({
          mode: s.modeName,
          charCount: s.charCount,
          valid: s.valid,
          bitOffset: s.bitOffset,
        })),
      });
      return {
        matrix: resultMatrix,
        vectorsApplied,
        scanResult: {
          success: false,
          error: `Post-search semantic validation failed: ${postSearchValidation.reason}`,
        },
      };
    }
  } else {
    log.warn('Binary search found 0 usable vectors - returning base matrix', {
      iterations: binarySearchResult.iterations,
    });
    return { matrix: baseMatrix, vectorsApplied: 0, scanResult: scanMatrixWithJsQR(baseMatrix) };
  }
}
