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
import type {
  BlockEliminationResult,
  BlockSelectionResult,
  EliminationResult,
} from './elimination';
import { applySelectedVectorsToBlock } from './elimination';
import type { RSBasisVector } from './rs-basis';
import {
  type ECCLevel,
  type FormatVerificationResult,
  type RejectionReason,
  validateSuffixCharset,
  verifyMatrixFormatInfo,
} from './validation';

/**
 * Rejection histogram for tracking why candidates were rejected.
 * Used for debugging and diagnosing acceptance policy issues.
 */
export interface RejectionHistogram {
  SCAN_FAILED: number;
  LENGTH_TOO_SHORT: number;
  BYTE_MISMATCH: number;
  ECC_MISMATCH: number;
  MASK_MISMATCH: number;
  SUFFIX_CHARSET_INVALID: number;
  ACCEPTED: number;
  total: number;
}

/**
 * Create an empty rejection histogram
 */
function createRejectionHistogram(): RejectionHistogram {
  return {
    SCAN_FAILED: 0,
    LENGTH_TOO_SHORT: 0,
    BYTE_MISMATCH: 0,
    ECC_MISMATCH: 0,
    MASK_MISMATCH: 0,
    SUFFIX_CHARSET_INVALID: 0,
    ACCEPTED: 0,
    total: 0,
  };
}

const log = createLogger('QART');

/**
 * Result of binary search validation
 */
interface BinarySearchValidationResult {
  valid: boolean;
  /** Rejection reason if hard gate failed */
  reason?: RejectionReason | 'SUFFIX_CHARSET_INVALID';
  description?: string;
  mismatchIndex?: number;
  expectedByte?: number;
  actualByte?: number;
  /** Soft penalty for suffix charset violations (0 = no penalty, higher = worse) */
  suffixCharsetPenalty?: number;
  /** Whether this was a hard gate failure vs soft penalty */
  hardGateFailed?: boolean;
}

/**
 * Validate that decoded data preserves the original data exactly (byte-level comparison).
 * This is the HARD GATE acceptance criteria for HYBRID QR-Art.
 *
 * HARD GATE REQUIREMENTS (must pass):
 * 1. Decoded data must exist
 * 2. Decoded data length >= original data length
 * 3. First N bytes must match exactly (N = original data length)
 *
 * SOFT PENALTY (does not cause rejection):
 * 4. Suffix charset violations are counted as soft penalty, NOT hard rejection
 *    This allows the optimizer to accept candidates with non-URL-safe suffix bytes.
 *    The suffix is intentionally mutable in HYBRID mode!
 *
 * @param decoded The decoded string from scanning
 * @param originalData The original data that must be preserved
 * @param strictSuffix If true, suffix charset violations cause hard rejection (default: false)
 * @returns Validation result with details
 */
function validateByteExactPrefix(
  decoded: string | undefined,
  originalData: string,
  strictSuffix: boolean = false
): BinarySearchValidationResult {
  if (decoded === undefined || decoded === null) {
    return {
      valid: false,
      reason: 'SCAN_FAILED',
      description: 'decoded data is null/undefined',
      hardGateFailed: true,
    };
  }

  if (decoded.length < originalData.length) {
    return {
      valid: false,
      reason: 'LENGTH_TOO_SHORT',
      description: `decoded length (${decoded.length}) < original length (${originalData.length})`,
      hardGateFailed: true,
    };
  }

  // Byte-exact comparison for the protected prefix - THIS IS THE HARD GATE
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.codePointAt(i)!;
    const actualByte = decoded.codePointAt(i)!;

    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: 'BYTE_MISMATCH',
        description: `byte mismatch at index ${i}: expected 0x${expectedByte.toString(16)}, got 0x${actualByte.toString(16)}`,
        mismatchIndex: i,
        expectedByte,
        actualByte,
        hardGateFailed: true,
      };
    }
  }

  // Calculate suffix charset penalty (SOFT PENALTY, not hard rejection by default)
  let suffixCharsetPenalty = 0;
  if (decoded.length > originalData.length) {
    const suffix = decoded.slice(originalData.length);
    const charsetValidation = validateSuffixCharset(suffix);

    if (!charsetValidation.valid) {
      // Count how many invalid characters are in the suffix
      let invalidCount = 0;
      for (let i = 0; i < suffix.length; i++) {
        const char = suffix[i];
        const charCode = suffix.codePointAt(i)!;
        // Check if character is outside printable ASCII or not URL-safe
        if (
          charCode < 32 ||
          charCode > 126 ||
          !'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~#'.includes(char)
        ) {
          invalidCount++;
        }
      }
      suffixCharsetPenalty = invalidCount / suffix.length;

      // If strictSuffix is enabled, reject on charset violation
      if (strictSuffix) {
        return {
          valid: false,
          reason: 'SUFFIX_CHARSET_INVALID',
          description: `Suffix contains invalid character at index ${charsetValidation.invalidCharIndex}: ${charsetValidation.invalidChar} (0x${charsetValidation.invalidCharCode?.toString(16)})`,
          mismatchIndex: originalData.length + (charsetValidation.invalidCharIndex ?? 0),
          actualByte: charsetValidation.invalidCharCode,
          suffixCharsetPenalty,
          hardGateFailed: true,
        };
      }
    }
  }

  // HARD GATE PASSED - candidate is accepted
  // Suffix charset penalty is recorded but does NOT cause rejection
  return {
    valid: true,
    suffixCharsetPenalty,
    hardGateFailed: false,
  };
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
  const blockResultMap = new Map<number, BlockEliminationResult>();
  for (const br of eliminationResult.blockResults) {
    blockResultMap.set(br.blockIndex, br);
  }

  for (const selection of blockSelections) {
    const { blockIndex, selectedVectorIndices } = selection;

    const blockResult = blockResultMap.get(blockIndex);
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
 * Flatten and order selections, optionally limiting to the top-K by importance.
 * Uses a min-heap when limit is provided to avoid full sort on large sets.
 */
export function flattenAndOrderSelectionsLimited(
  blockSelections: BlockSelectionResult[],
  eliminationResult: EliminationResult,
  importance: number[][],
  moduleCount: number,
  limit?: number
): FlattenedSelection[] {
  if (!limit || limit <= 0) {
    return flattenAndOrderSelections(blockSelections, eliminationResult, importance, moduleCount);
  }

  const heap: FlattenedSelection[] = [];

  const heapSwap = (i: number, j: number) => {
    const tmp = heap[i];
    heap[i] = heap[j];
    heap[j] = tmp;
  };

  const heapBubbleUp = (index: number) => {
    let i = index;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].importance <= heap[i].importance) break;
      heapSwap(parent, i);
      i = parent;
    }
  };

  const heapBubbleDown = (index: number) => {
    let i = index;
    const n = heap.length;
    while (true) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && heap[left].importance < heap[smallest].importance) smallest = left;
      if (right < n && heap[right].importance < heap[smallest].importance) smallest = right;
      if (smallest === i) break;
      heapSwap(i, smallest);
      i = smallest;
    }
  };

  const maybePush = (entry: FlattenedSelection) => {
    if (heap.length < limit) {
      heap.push(entry);
      heapBubbleUp(heap.length - 1);
      return;
    }
    if (entry.importance > heap[0].importance) {
      heap[0] = entry;
      heapBubbleDown(0);
    }
  };

  const blockResultMap = new Map<number, BlockEliminationResult>();
  for (const br of eliminationResult.blockResults) {
    blockResultMap.set(br.blockIndex, br);
  }

  for (const selection of blockSelections) {
    const { blockIndex, selectedVectorIndices } = selection;

    const blockResult = blockResultMap.get(blockIndex);
    if (!blockResult) continue;

    for (const vectorIndex of selectedVectorIndices) {
      const vector = blockResult.vectors[vectorIndex];
      if (!vector || vector.pivotPixel < 0) continue;

      const row = Math.floor(vector.pivotPixel / moduleCount);
      const col = vector.pivotPixel % moduleCount;
      const pixelImportance = importance[row]?.[col] ?? 0;

      maybePush({
        blockIndex,
        vectorIndex,
        importance: pixelImportance,
        vector,
      });
    }
  }

  heap.sort((a, b) => b.importance - a.importance);
  return heap;
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
  const matrix = regenerateQRFn(
    modifiedBlockData,
    modifiedBlockEcc,
    blockDataCounts,
    blockEccCounts
  );

  return { matrix, modifiedBlockData, modifiedBlockEcc };
}

interface CandidateValidation {
  isValid: boolean;
  validation: BinarySearchValidationResult;
  formatVerification?: FormatVerificationResult;
}

function validateCandidate(
  scan: { success: boolean; data?: string },
  matrix: boolean[][],
  expectedData: string,
  expectedEcc: ECCLevel | undefined,
  expectedMask: number | undefined,
  strictSuffix: boolean
): CandidateValidation {
  if (!scan.success) {
    return {
      isValid: false,
      validation: {
        valid: false,
        reason: 'SCAN_FAILED',
        description: 'not scanned',
        hardGateFailed: true,
      },
    };
  }

  const validation = validateByteExactPrefix(scan.data, expectedData, strictSuffix);
  if (!validation.valid) {
    return { isValid: false, validation };
  }

  if (expectedEcc !== undefined && expectedMask !== undefined) {
    const formatVerification = verifyMatrixFormatInfo(matrix, expectedEcc, expectedMask);
    if (!formatVerification.valid) {
      return {
        isValid: false,
        validation: {
          valid: false,
          reason: formatVerification.reason || 'ECC_MISMATCH',
          description: `Format info mismatch: ECC ${formatVerification.extractedEcc} vs ${expectedEcc}, mask ${formatVerification.extractedMask} vs ${expectedMask}`,
          hardGateFailed: true,
        },
        formatVerification,
      };
    }
    return { isValid: true, validation, formatVerification };
  }

  return { isValid: true, validation };
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
 * SEMANTIC-HARD-GATE: Also verifies format info (ECC and mask) match expected values.
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
 * @param expectedEcc Expected ECC level (for format info verification)
 * @param expectedMask Expected mask pattern (for format info verification)
 * @param strictSuffix If true, reject candidates with non-URL-safe suffix bytes (default: false)
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
  expectedData: string,
  expectedEcc?: ECCLevel,
  expectedMask?: number,
  strictSuffix: boolean = false
): BinarySearchResult {
  const totalVectors = flattened.length;

  // Initialize rejection histogram for tracking why candidates were rejected
  const rejectionHistogram = createRejectionHistogram();

  log.info('Starting binary search for maximum scannable vectors', {
    totalVectors,
    expectedDataLength: expectedData.length,
    expectedDataPreview:
      expectedData.length > 50 ? `${expectedData.slice(0, 50)}...` : expectedData,
    formatVerificationEnabled: expectedEcc !== undefined && expectedMask !== undefined,
    expectedEcc,
    expectedMask,
    strictSuffix,
    note: strictSuffix
      ? 'SEMANTIC-HARD-GATE: prefix match + format info + strict suffix charset'
      : 'SEMANTIC-HARD-GATE: prefix match + format info (suffix charset is SOFT PENALTY)',
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
    log.warn('Base matrix (0 vectors) does not scan - this is a fundamental bug');
    return {
      maxCount: 0,
      matrix: baseResult.matrix,
      modifiedBlockData: baseResult.modifiedBlockData,
      modifiedBlockEcc: baseResult.modifiedBlockEcc,
      iterations: 1,
    };
  }

  // CRITICAL: Use STRICT byte-exact validation for base matrix
  // HYBRID MODE: expectedData is the original URL only - suffix may vary
  // We use byte-exact comparison to catch subtle corruption
  const baseValidation = validateByteExactPrefix(baseScan.data, expectedData, strictSuffix);
  rejectionHistogram.total++;

  if (!baseValidation.valid) {
    // Generate hex dump of first 32 bytes for comparison
    const decoded = baseScan.data || '';
    const expectedHexDump = Array.from(expectedData.slice(0, 32))
      .map((c) => c.codePointAt(0)!.toString(16).padStart(2, '0'))
      .join(' ');
    const decodedHexDump = Array.from(decoded.slice(0, 32))
      .map((c) => c.codePointAt(0)!.toString(16).padStart(2, '0'))
      .join(' ');

    log.warn('Base matrix (0 vectors) validation FAILED - encoding bug!', {
      rejectionReason: baseValidation.reason,
      description: baseValidation.description,
      expectedData: expectedData,
      expectedDataLength: expectedData.length,
      decodedData: baseScan.data,
      decodedLength: baseScan.data?.length,
      mismatchIndex: baseValidation.mismatchIndex,
      expectedByte: baseValidation.expectedByte?.toString(16),
      actualByte: baseValidation.actualByte?.toString(16),
    });

    log.warn('BYTE-LEVEL COMPARISON (first 32 bytes)', {
      expectedHex: expectedHexDump,
      decodedHex: decodedHexDump,
      mismatchIndex: baseValidation.mismatchIndex,
    });

    // Return base matrix anyway - at least it scans to something
    return {
      maxCount: 0,
      matrix: baseResult.matrix,
      modifiedBlockData: baseResult.modifiedBlockData,
      modifiedBlockEcc: baseResult.modifiedBlockEcc,
      iterations: 1,
    };
  }

  // Also verify format info for base matrix (if ECC and mask provided)
  let baseFormatVerification: FormatVerificationResult | undefined;
  if (expectedEcc !== undefined && expectedMask !== undefined) {
    baseFormatVerification = verifyMatrixFormatInfo(baseResult.matrix, expectedEcc, expectedMask);
    if (!baseFormatVerification.valid) {
      log.warn('Base matrix (0 vectors) FORMAT VERIFICATION FAILED!', {
        rejectionReason: baseFormatVerification.reason,
        expectedEcc,
        extractedEcc: baseFormatVerification.extractedEcc,
        eccMatch: baseFormatVerification.eccMatch,
        expectedMask,
        extractedMask: baseFormatVerification.extractedMask,
        maskMatch: baseFormatVerification.maskMatch,
      });
      // This is a critical bug in the base matrix generation
      // Return base matrix anyway as there's nothing better to return
    }
  }

  rejectionHistogram.ACCEPTED++;

  log.debug('Base matrix (0 vectors) validation PASSED', {
    decodedData: baseScan.data,
    decodedLength: baseScan.data?.length,
    validationMethod: 'SEMANTIC_HARD_GATE',
    formatVerified: baseFormatVerification?.valid,
    extractedEcc: baseFormatVerification?.extractedEcc,
    extractedMask: baseFormatVerification?.extractedMask,
    suffixCharsetPenalty: baseValidation.suffixCharsetPenalty,
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

    // SEMANTIC-HARD-GATE FOR HYBRID QR-ART:
    // A configuration "works" if ALL of the following are true:
    // 1. The QR scans successfully
    // 2. Decoded data length >= original data length
    // 3. First N bytes match exactly (N = original data length)
    // 4. Format info ECC matches expected (if provided)
    // 5. Format info mask matches expected (if provided)
    //
    // We use byte-exact comparison to catch subtle corruption.
    // The suffix CAN be modified - that's the point of QR-Art!
    // Only the original URL/data (protected region) must be byte-for-byte identical.

    rejectionHistogram.total++;
    const candidateResult = validateCandidate(
      scan,
      result.matrix,
      expectedData,
      expectedEcc,
      expectedMask,
      strictSuffix
    );
    const isValid = candidateResult.isValid;
    const validation = candidateResult.validation;
    const formatVerification = candidateResult.formatVerification;
    if (isValid) rejectionHistogram.ACCEPTED++;

    // Track rejection reasons in histogram
    if (!isValid && validation.reason) {
      const reason = validation.reason as keyof RejectionHistogram;
      if (reason in rejectionHistogram && reason !== 'ACCEPTED' && reason !== 'total') {
        rejectionHistogram[reason]++;
      }
    }

    // Per-candidate logging with hardGate pass/fail, rejection reason, vectorsApplied count
    log.debug('Binary search iteration', {
      iteration: iterations,
      vectorsApplied: mid,
      low,
      high,
      // Hard gate status
      hardGatePassed: isValid,
      hardGateFailed: validation.hardGateFailed,
      scans: scan.success,
      byteExactValid: validation.valid || isValid,
      // Rejection details
      rejectionReason: isValid ? undefined : validation.reason,
      description: isValid ? undefined : validation.description,
      mismatchIndex: validation.mismatchIndex,
      // Soft penalty (suffix charset)
      suffixCharsetPenalty: validation.suffixCharsetPenalty,
      // Format info details if verified
      ...(formatVerification
        ? {
            formatVerified: formatVerification.valid,
            extractedEcc: formatVerification.extractedEcc,
            extractedMask: formatVerification.extractedMask,
            eccMatch: formatVerification.eccMatch,
            maskMatch: formatVerification.maskMatch,
          }
        : {}),
      // Show details about the decoded data
      ...(scan.success
        ? {
            decodedLength: scan.data?.length,
            originalLength: expectedData.length,
            suffixPreview: scan.data?.slice(expectedData.length)?.slice(0, 20),
          }
        : {}),
    });

    if (isValid) {
      // This count works - all semantic checks passed, try more vectors for better image
      bestCount = mid;
      bestMatrix = result.matrix;
      bestBlockData = result.modifiedBlockData;
      bestBlockEcc = result.modifiedBlockEcc;
      low = mid + 1;
    } else {
      // This count doesn't work (scan failed, byte mismatch, or format info mismatch), try fewer
      high = mid - 1;
    }
  }

  // Log rejection histogram at end of binary search
  log.info('Binary search complete', {
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
          : 'N/A',
    },
  });

  // Warn if suffix charset rejections are dominating and strictSuffix is enabled
  if (strictSuffix && rejectionHistogram.SUFFIX_CHARSET_INVALID > rejectionHistogram.ACCEPTED) {
    log.warn('High suffix charset rejection rate with strictSuffix=true', {
      suffixCharsetRejections: rejectionHistogram.SUFFIX_CHARSET_INVALID,
      accepted: rejectionHistogram.ACCEPTED,
      suggestion: 'Consider setting strictSuffix=false to allow more candidates',
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
