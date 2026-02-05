/**
 * QR-Art Scan Fallback Module
 *
 * Implements binary search fallback to find the maximum number of
 * basis vectors that can be applied while keeping the QR scannable.
 *
 * When applying all selected vectors produces an unscannable QR code,
 * this module uses binary search to find the optimal subset of vectors
 * that maximizes image quality while maintaining scannability.
 * 
 * HYBRID ACCEPTANCE CRITERIA:
 * - Decoder must successfully scan (success=true)
 * - Decoded data must be long enough (length >= originalLength)
 * - First N bytes must match exactly (byte-exact comparison)
 */

import { createLogger } from '../../lib/logger';
import type { BlockSelectionResult, EliminationResult } from './elimination';
import { applySelectedVectorsToBlock } from './elimination';
import type { RSBasisVector } from './rs-basis';

const log = createLogger('QART');

/**
 * Validate that decoded data preserves the original data exactly (byte-level comparison).
 * This is the STRICT acceptance criteria for HYBRID QR-Art.
 * 
 * Requirements:
 * 1. Decoded data must exist
 * 2. Decoded data length >= original data length
 * 3. First N bytes must match exactly (N = original data length)
 * 
 * @param decoded The decoded string from scanning
 * @param originalData The original data that must be preserved
 * @returns Validation result with details
 */
function validateByteExactPrefix(
  decoded: string | undefined,
  originalData: string
): {
  valid: boolean;
  reason?: string;
  mismatchIndex?: number;
  expectedByte?: number;
  actualByte?: number;
} {
  if (decoded === undefined || decoded === null) {
    return { valid: false, reason: 'decoded data is null/undefined' };
  }
  
  if (decoded.length < originalData.length) {
    return { 
      valid: false, 
      reason: `decoded length (${decoded.length}) < original length (${originalData.length})` 
    };
  }
  
  // Byte-exact comparison for the protected prefix
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.charCodeAt(i);
    const actualByte = decoded.charCodeAt(i);
    
    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: `byte mismatch at index ${i}`,
        mismatchIndex: i,
        expectedByte,
        actualByte,
      };
    }
  }
  
  return { valid: true };
}

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
 * a scannable QR code that preserves the original data.
 *
 * HYBRID STRATEGY: The decoded data must START WITH expectedData (prefix match).
 * The suffix portion CAN be modified - that's the whole point of QR-Art!
 * Only the original URL/content (protected region) must be preserved.
 *
 * @param flattened Flattened and importance-sorted selections
 * @param originalBlockData Original block data arrays
 * @param originalBlockEcc Original block ECC arrays
 * @param blockDataCounts Data counts per block
 * @param blockEccCounts ECC counts per block
 * @param eliminationResult Full elimination result
 * @param regenerateQRFn Function to regenerate QR matrix
 * @param scanQRFn Function to scan QR matrix and check validity
 * @param expectedData The original data that must be preserved (HYBRID: prefix match)
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
    note: 'HYBRID: prefix match validation (original data must be preserved, suffix can vary)',
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
  
  // CRITICAL: Use STRICT byte-exact validation for base matrix
  // HYBRID MODE: expectedData is the original URL only - suffix may vary
  // We use byte-exact comparison to catch subtle corruption
  const baseValidation = validateByteExactPrefix(baseScan.data, expectedData);
  
  if (!baseValidation.valid) {
    // Generate hex dump of first 32 bytes for comparison
    const decoded = baseScan.data || '';
    const expectedHexDump = Array.from(expectedData.slice(0, 32)).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    const decodedHexDump = Array.from(decoded.slice(0, 32)).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    
    log.error('Base matrix (0 vectors) byte-exact validation FAILED - encoding bug!', {
      expectedData: expectedData,
      expectedDataLength: expectedData.length,
      decodedData: baseScan.data,
      decodedLength: baseScan.data?.length,
      validationReason: baseValidation.reason,
      mismatchIndex: baseValidation.mismatchIndex,
      expectedByte: baseValidation.expectedByte?.toString(16),
      actualByte: baseValidation.actualByte?.toString(16),
    });
    
    log.error('BYTE-LEVEL COMPARISON (first 32 bytes)', {
      expectedHex: expectedHexDump,
      decodedHex: decodedHexDump,
      mismatchIndex: baseValidation.mismatchIndex,
    });
    
    // Return base matrix anyway - at least it scans to something
    return { maxCount: 0, matrix: baseResult.matrix, modifiedBlockData: baseResult.modifiedBlockData, modifiedBlockEcc: baseResult.modifiedBlockEcc, iterations: 1 };
  }
  
  log.debug('Base matrix (0 vectors) byte-exact validation PASSED', {
    decodedData: baseScan.data,
    decodedLength: baseScan.data?.length,
    validationMethod: 'BYTE_EXACT_PREFIX',
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
    
    // CRITICAL FOR HYBRID QR-ART: Use STRICT byte-exact validation
    // A configuration "works" if:
    // 1. The QR scans successfully AND
    // 2. Decoded data length >= original data length AND
    // 3. First N bytes match exactly (N = original data length)
    //
    // We use byte-exact comparison to catch subtle corruption.
    // The suffix CAN be modified - that's the point of QR-Art!
    // Only the original URL/data (protected region) must be byte-for-byte identical.
    
    let originalDataValid = false;
    let validation: ReturnType<typeof validateByteExactPrefix> = { valid: false, reason: 'not scanned' };
    
    if (scan.success) {
      validation = validateByteExactPrefix(scan.data, expectedData);
      originalDataValid = validation.valid;
    }

    log.debug('Binary search iteration', {
      iteration: iterations,
      low,
      high,
      mid,
      scans: scan.success,
      byteExactValid: originalDataValid,
      validationReason: validation.valid ? undefined : validation.reason,
      mismatchIndex: validation.mismatchIndex,
      // Show details about the decoded data
      ...(scan.success ? {
        decodedLength: scan.data?.length,
        originalLength: expectedData.length,
        suffixModified: scan.data?.slice(expectedData.length)?.slice(0, 20),
      } : {}),
    });

    if (originalDataValid) {
      // This count works - original data is preserved (byte-exact), try more vectors for better image
      bestCount = mid;
      bestMatrix = result.matrix;
      bestBlockData = result.modifiedBlockData;
      bestBlockEcc = result.modifiedBlockEcc;
      low = mid + 1;
    } else {
      // This count doesn't work (either doesn't scan OR byte-exact validation failed), try fewer
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
