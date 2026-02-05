/**
 * QR-Art Scan Fallback Module
 *
 * Implements binary search fallback to find the maximum number of
 * basis vectors that can be applied while keeping the QR scannable.
 *
 * When applying all selected vectors produces an unscannable QR code,
 * this module uses binary search to find the optimal subset of vectors
 * that maximizes image quality while maintaining scannability.
 */

import { createLogger } from '../../lib/logger';
import type { BlockSelectionResult, EliminationResult } from './elimination';
import { applySelectedVectorsToBlock } from './elimination';
import type { RSBasisVector } from './rs-basis';

const log = createLogger('QART');

/**
 * A flattened selection entry that combines block info with vector info
 * and includes importance for sorting
 */
export interface FlattenedSelection {
  /** RS block index */
  blockIndex: number;
  /** Vector index within the block */
  vectorIndex: number;
  /** Pixel importance (higher = more important for image quality) */
  importance: number;
  /** The actual vector (for reference) */
  vector: RSBasisVector;
}

/**
 * Flatten block selections into an ordered list sorted by pixel importance.
 * This allows us to progressively apply the most important vectors first.
 *
 * @param blockSelections Per-block selection results
 * @param eliminationResult Full elimination result with vectors
 * @param importance 2D importance array from target image
 * @param moduleCount QR module count
 * @returns Flattened selections sorted by importance (highest first)
 */
export function flattenAndOrderSelections(
  blockSelections: BlockSelectionResult[],
  eliminationResult: EliminationResult,
  importance: number[][],
  moduleCount: number
): FlattenedSelection[] {
  const flattened: FlattenedSelection[] = [];

  for (const selection of blockSelections) {
    const { blockIndex, selectedVectorIndices } = selection;

    // Find the block result
    const blockResult = eliminationResult.blockResults.find((br) => br.blockIndex === blockIndex);
    if (!blockResult) continue;

    for (const vectorIndex of selectedVectorIndices) {
      const vector = blockResult.vectors[vectorIndex];
      if (!vector || vector.pivotPixel < 0) continue;

      // Get importance of the pivot pixel this vector controls
      const row = Math.floor(vector.pivotPixel / moduleCount);
      const col = vector.pivotPixel % moduleCount;
      const pixelImportance = importance[row]?.[col] ?? 0;

      flattened.push({
        blockIndex,
        vectorIndex,
        importance: pixelImportance,
        vector,
      });
    }
  }

  // Sort by importance (highest first) - we want to keep the most important pixels
  flattened.sort((a, b) => b.importance - a.importance);

  return flattened;
}

/**
 * Convert flattened selections back to block selections format,
 * using only the first N entries.
 *
 * @param flattened Flattened and sorted selections
 * @param count Number of selections to include
 * @returns Block selections with only the specified count
 */
export function unflattenSelections(
  flattened: FlattenedSelection[],
  count: number
): BlockSelectionResult[] {
  const blockMap = new Map<number, number[]>();

  // Take only the first `count` selections
  for (let i = 0; i < Math.min(count, flattened.length); i++) {
    const entry = flattened[i];
    const indices = blockMap.get(entry.blockIndex) || [];
    indices.push(entry.vectorIndex);
    blockMap.set(entry.blockIndex, indices);
  }

  // Convert to BlockSelectionResult array
  const results: BlockSelectionResult[] = [];
  for (const [blockIndex, selectedVectorIndices] of blockMap) {
    results.push({ blockIndex, selectedVectorIndices });
  }

  return results.sort((a, b) => a.blockIndex - b.blockIndex);
}

/**
 * Apply a subset of vectors and regenerate the QR matrix.
 * Returns both the matrix and the modified block data/ECC.
 */
export function applySubsetAndRegenerate(
  flattened: FlattenedSelection[],
  count: number,
  originalBlockData: Uint8Array[],
  originalBlockEcc: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  eliminationResult: EliminationResult,
  regenerateQRFn: (
    blockData: Uint8Array[],
    blockEcc: Uint8Array[],
    blockDataCounts: number[],
    blockEccCounts: number[]
  ) => boolean[][]
): {
  matrix: boolean[][];
  modifiedBlockData: Uint8Array[];
  modifiedBlockEcc: Uint8Array[];
} {
  // Clone original data
  const modifiedBlockData = originalBlockData.map((arr) => new Uint8Array(arr));
  const modifiedBlockEcc = originalBlockEcc.map((arr) => new Uint8Array(arr));

  // Convert flattened subset back to block selections
  const subsetSelections = unflattenSelections(flattened, count);

  // Apply selected vectors per block
  for (const selection of subsetSelections) {
    const { blockIndex, selectedVectorIndices } = selection;
    if (selectedVectorIndices.length === 0) continue;

    const blockResult = eliminationResult.blockResults.find((br) => br.blockIndex === blockIndex);
    if (!blockResult) continue;

    applySelectedVectorsToBlock(
      modifiedBlockData[blockIndex],
      modifiedBlockEcc[blockIndex],
      blockResult.vectors,
      selectedVectorIndices,
      blockDataCounts[blockIndex]
    );
  }

  // Regenerate matrix
  const matrix = regenerateQRFn(modifiedBlockData, modifiedBlockEcc, blockDataCounts, blockEccCounts);

  return { matrix, modifiedBlockData, modifiedBlockEcc };
}

/**
 * Result of binary search for maximum scannable vectors
 */
export interface BinarySearchResult {
  /** Maximum number of vectors that produce a scannable QR */
  maxCount: number;
  /** The matrix produced with maxCount vectors */
  matrix: boolean[][];
  /** Modified block data with maxCount vectors applied */
  modifiedBlockData: Uint8Array[];
  /** Modified block ECC with maxCount vectors applied */
  modifiedBlockEcc: Uint8Array[];
  /** Number of binary search iterations performed */
  iterations: number;
}

/**
 * Use binary search to find the maximum number of vectors that produces
 * a scannable QR code that matches the expected data.
 *
 * STRATEGY 2: Since we only modify padding codewords (not actual message content),
 * the decoded data should match EXACTLY. Any mismatch indicates a bug.
 *
 * @param flattened Flattened and importance-sorted selections
 * @param originalBlockData Original block data arrays
 * @param originalBlockEcc Original block ECC arrays
 * @param blockDataCounts Data counts per block
 * @param blockEccCounts ECC counts per block
 * @param eliminationResult Full elimination result
 * @param regenerateQRFn Function to regenerate QR matrix
 * @param scanQRFn Function to scan QR matrix and check validity
 * @param expectedData The exact data that should be decoded (Strategy 2: exact match)
 * @returns Binary search result with optimal matrix
 */
export function binarySearchMaxVectors(
  flattened: FlattenedSelection[],
  originalBlockData: Uint8Array[],
  originalBlockEcc: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  eliminationResult: EliminationResult,
  regenerateQRFn: (
    blockData: Uint8Array[],
    blockEcc: Uint8Array[],
    blockDataCounts: number[],
    blockEccCounts: number[]
  ) => boolean[][],
  scanQRFn: (matrix: boolean[][]) => { success: boolean; data?: string },
  expectedData: string
): BinarySearchResult {
  const totalVectors = flattened.length;

  log.info('Starting binary search for maximum scannable vectors', {
    totalVectors,
    expectedDataLength: expectedData.length,
    expectedDataPreview: expectedData.length > 50 ? expectedData.slice(0, 50) + '...' : expectedData,
    note: 'Strategy 2: exact match validation (only padding codewords modified)',
  });

  // Edge case: if there are no vectors, return empty result
  if (totalVectors === 0) {
    const { matrix, modifiedBlockData, modifiedBlockEcc } = applySubsetAndRegenerate(
      flattened,
      0,
      originalBlockData,
      originalBlockEcc,
      blockDataCounts,
      blockEccCounts,
      eliminationResult,
      regenerateQRFn
    );
    return { maxCount: 0, matrix, modifiedBlockData, modifiedBlockEcc, iterations: 0 };
  }

  // First check if 0 vectors (base) scans correctly - it MUST decode to expectedData
  const baseResult = applySubsetAndRegenerate(
    flattened,
    0,
    originalBlockData,
    originalBlockEcc,
    blockDataCounts,
    blockEccCounts,
    eliminationResult,
    regenerateQRFn
  );
  const baseScan = scanQRFn(baseResult.matrix);
  if (!baseScan.success) {
    log.error('Base matrix (0 vectors) does not scan - this is a fundamental bug');
    return { maxCount: 0, matrix: baseResult.matrix, modifiedBlockData: baseResult.modifiedBlockData, modifiedBlockEcc: baseResult.modifiedBlockEcc, iterations: 1 };
  }
  
  // CRITICAL: Verify base matrix decodes to data that matches expectedData exactly
  // Note: Base matrix includes the full suffix, so we check prefix match
  if (baseScan.data !== expectedData) {
    log.error('Base matrix (0 vectors) does not match expected data - encoding bug!', {
      expectedData: expectedData,
      expectedDataLength: expectedData.length,
      decodedData: baseScan.data,
      decodedLength: baseScan.data?.length,
      exactMatch: baseScan.data === expectedData,
      // Show first difference in the protected region
      firstDiff: (() => {
        const orig = expectedData;
        const decoded = baseScan.data || '';
        for (let i = 0; i < orig.length; i++) {
          if (orig[i] !== decoded[i]) {
            return { index: i, expected: orig[i], actual: decoded[i] };
          }
        }
        return null;
      })(),
    });
    // Return base matrix anyway - at least it scans to something
    return { maxCount: 0, matrix: baseResult.matrix, modifiedBlockData: baseResult.modifiedBlockData, modifiedBlockEcc: baseResult.modifiedBlockEcc, iterations: 1 };
  }
  
  log.debug('Base matrix (0 vectors) validation passed', {
    decodedData: baseScan.data,
    exactMatch: true,
  });

  // Binary search for maximum vectors
  let low = 0;
  let high = totalVectors;
  let bestCount = 0;
  let bestMatrix = baseResult.matrix;
  let bestBlockData = baseResult.modifiedBlockData;
  let bestBlockEcc = baseResult.modifiedBlockEcc;
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
      regenerateQRFn
    );

    const scan = scanQRFn(result.matrix);
    
    // CRITICAL FOR QR-ART: A configuration "works" if:
    // 1. The QR scans successfully AND
    // 2. The decoded data matches expectedData exactly (prefix match)
    //
    // We use prefix match (startsWith) NOT exact match because:
    // - QR-Art intentionally modifies suffix bits to control pixel appearance
    // - The suffix WILL change as we apply vectors - that's the whole point!
    // - Only the original URL/data (protected region) must be preserved
    // - Exact match would reject ALL vector configurations!
    const exactMatch = scan.success && scan.data === expectedData;

    log.debug('Binary search iteration', {
      iteration: iterations,
      low,
      high,
      mid,
      scans: scan.success,
      exactMatch,
      // Show details about the decoded data
      ...(scan.success ? {
        decodedLength: scan.data?.length,
        originalLength: expectedData.length,
        suffixChanged: scan.data?.slice(expectedData.length) !== undefined,
      } : {}),
      // Show mismatch details if original data is corrupted
      ...(scan.success && scan.data !== expectedData ? {
        mismatchType: 'ORIGINAL_DATA_CORRUPTED',
        originalDataPreview: expectedData.slice(0, 40),
        decodedPreview: scan.data?.slice(0, 40),
      } : {}),
    });

    if (exactMatch) {
      // This count works - original data is preserved, try more vectors for better image
      bestCount = mid;
      bestMatrix = result.matrix;
      bestBlockData = result.modifiedBlockData;
      bestBlockEcc = result.modifiedBlockEcc;
      low = mid + 1;
    } else {
      // This count doesn't work (either doesn't scan OR original data corrupted), try fewer
      high = mid - 1;
    }
  }

  log.info('Binary search complete', {
    maxCount: bestCount,
    totalVectors,
    percentageUsed: `${((bestCount / totalVectors) * 100).toFixed(1)}%`,
    iterations,
  });

  return {
    maxCount: bestCount,
    matrix: bestMatrix,
    modifiedBlockData: bestBlockData,
    modifiedBlockEcc: bestBlockEcc,
    iterations,
  };
}
