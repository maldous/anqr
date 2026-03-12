import { buildBitPixelMap } from './bit-mapping';
import {
  type BlockSelectionResult,
  gaussJordanEliminate,
  rankPixelsByImportance,
  selectBasisVectorsForTarget,
} from './elimination';
import { buildFullBasis } from './rs-basis';
import { flattenAndOrderSelectionsLimited } from './scan-fallback';
import { acquireUint8Buffer, releaseUint8Buffer } from './buffer-pool';
import { log } from './log';
import { buildBlockSelectionsFromFlattened } from './build-block-selections-from-flattened';
import { filterSelectionsForNumericSuffix } from './filter-selections-for-numeric-suffix';
import { logSelectionTiming } from './log-selection-timing';
import type { QArtPerformanceSettings } from './q-art-performance-settings';
import type { VectorSelectionResult } from './vector-selection-result';
import type { QArtPerformanceProfile } from './generate.types';
import type { EncoderDerivedLayout } from './generate.types';

export function selectAndFilterVectors(
  basis: ReturnType<typeof buildFullBasis>,
  mappings: ReturnType<typeof buildBitPixelMap>,
  targets: boolean[][],
  importance: number[][],
  baseMatrix: boolean[][],
  moduleCount: number,
  dataPixelIndices: number[],
  dataPixels: Set<number>,
  performanceSettings: QArtPerformanceSettings,
  performanceProfile: QArtPerformanceProfile,
  resolvedSuffixMode: 'numeric' | 'byte',
  strictSuffix: boolean,
  blockDataArrays: Uint8Array[],
  blockDataCounts: number[],
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  actualMask: number
): VectorSelectionResult {
  // Step 5: Rank pixels by importance
  const rankedPixelOrder = rankPixelsByImportance(targets, importance, moduleCount, dataPixels);
  let eliminationPixelOrder = rankedPixelOrder;
  if (performanceSettings.maxCandidateFraction < 1) {
    const candidateCap = Math.max(
      64,
      Math.floor(moduleCount * moduleCount * performanceSettings.maxCandidateFraction)
    );
    const cappedLength = Math.min(rankedPixelOrder.length, candidateCap);
    eliminationPixelOrder = rankedPixelOrder.slice(0, cappedLength);
    log.info('QR-Art candidate cap applied', {
      originalCandidates: rankedPixelOrder.length,
      cappedCandidates: eliminationPixelOrder.length,
      moduleCount,
      performanceProfile,
    });
  }

  log.debug('Pixels ranked', {
    totalDataPixels: rankedPixelOrder.length,
    eliminationCandidates: eliminationPixelOrder.length,
  });

  // Step 6: Gauss-Jordan elimination
  const elimination = gaussJordanEliminate(
    basis.vectors,
    mappings,
    moduleCount,
    actualMask,
    eliminationPixelOrder
  );

  log.info('Gauss-Jordan elimination complete', {
    controllablePixels: elimination.controllablePixels,
    totalDataPixels: eliminationPixelOrder.length,
    controlPercentage: `${((elimination.controllablePixels / Math.max(1, eliminationPixelOrder.length)) * 100).toFixed(1)}%`,
  });

  // Step 7: Select which vectors to apply (per-block)
  const timingEnabled = typeof process !== 'undefined' && process?.env?.QART_TIMING === '1';
  const timingMarks: Record<string, number> = {};
  const mark = (label: string) => {
    if (timingEnabled) timingMarks[label] = performance.now();
  };

  const pixelDiff = acquireUint8Buffer(moduleCount * moduleCount);
  let blockSelections: BlockSelectionResult[] = [];
  try {
    for (const pixelIdx of dataPixelIndices) {
      const row = Math.floor(pixelIdx / moduleCount);
      const col = pixelIdx % moduleCount;
      const target = targets[row]?.[col] ?? false;
      const base = baseMatrix[row]?.[col] ?? false;
      if (target !== base) pixelDiff[pixelIdx] = 1;
    }

    mark('select_start');
    blockSelections = selectBasisVectorsForTarget(
      elimination,
      targets,
      baseMatrix,
      moduleCount,
      pixelDiff
    );
    mark('select_done');
  } finally {
    releaseUint8Buffer(pixelDiff);
  }

  let totalSelected = blockSelections.reduce((sum, s) => sum + s.selectedVectorIndices.length, 0);
  log.debug('Vectors selected', {
    selectedCount: totalSelected,
    controllable: elimination.controllablePixels,
    blocksWithSelections: blockSelections.filter((s) => s.selectedVectorIndices.length > 0).length,
  });

  // Pre-reduce selection size using ECC budget ratio (fast heuristic)
  // Disabled by default: can over-reduce and remove visible artwork.
  const preReduceTargetCount: number | undefined = undefined;

  mark('flatten_start');
  let flattenedSelections = flattenAndOrderSelectionsLimited(
    blockSelections,
    elimination,
    importance,
    moduleCount,
    preReduceTargetCount
  );
  mark('flatten_done');

  if (preReduceTargetCount && flattenedSelections.length > 0) {
    blockSelections = buildBlockSelectionsFromFlattened(
      flattenedSelections,
      elimination.blockResults.map((b) => b.blockIndex)
    );
    totalSelected = flattenedSelections.length;
  }

  // Numeric suffix safety: greedily filter selections to preserve numeric validity
  if (resolvedSuffixMode === 'numeric' && strictSuffix) {
    const preFilterCount = flattenedSelections.length;
    mark('numeric_filter_start');
    const filteredSelections = filterSelectionsForNumericSuffix(
      flattenedSelections,
      blockDataArrays,
      blockDataCounts,
      encoderLayout,
      actualVersion
    );
    mark('numeric_filter_done');

    if (filteredSelections.length !== preFilterCount) {
      blockSelections = buildBlockSelectionsFromFlattened(
        filteredSelections,
        elimination.blockResults.map((b) => b.blockIndex)
      );
      totalSelected = blockSelections.reduce((sum, s) => sum + s.selectedVectorIndices.length, 0);
      flattenedSelections = filteredSelections;
      log.info('Numeric suffix selection constrained', {
        selectedCount: totalSelected,
        removed: preFilterCount - filteredSelections.length,
        controllable: elimination.controllablePixels,
      });
    }
  }

  // NOTE: No static vector cap. The binary search fallback in scan-fallback.ts
  // dynamically finds the maximum safe vector count for phone cameras.

  logSelectionTiming(timingEnabled, timingMarks, preReduceTargetCount, totalSelected);

  return { blockSelections, flattenedSelections, totalSelected, elimination };
}
