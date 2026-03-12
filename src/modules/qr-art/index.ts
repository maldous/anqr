/**
 * QArt Module - Artistic QR Code Generation
 *
 * Based on the QArt algorithm by Russ Cox (https://research.swtch.com/qart)
 * Repository: https://github.com/rsc/qr/tree/master/qart
 *
 * The QArt technique creates QR codes with embedded images by exploiting
 * Reed-Solomon error correction properties:
 *
 * 1. Reed-Solomon codes are systematic and linear over a finite field
 * 2. Valid RS blocks are closed under XOR: b1 ⊕ b2 is valid if both b1, b2 are valid
 * 3. By constructing a basis of RS blocks, we can control individual pixels
 * 4. Gauss-Jordan elimination trades control between data and ECC pixels
 *
 * This module provides:
 * - Types for QArt configuration
 * - Pixel mapping between QR modules and image pixels
 * - Reed-Solomon basis block generation (future)
 * - Linear algebra utilities for pixel control (future)
 */

import { createLogger } from '../../infra/logging/logger';
import { type ECCLevel, qrcode } from '../qr-encoder';

const log = createLogger('QART');

// ============================================
// TYPES
// ============================================

/**
 * Configuration for QArt generation
 */
export interface QArtConfig {
  /** The URL or text to encode (typically a URL with numeric fragment) */
  data: string;
  /** Target QR version (1-40) */
  version: number;
  /** Error correction level (L recommended for max visual control) */
  ecc: ECCLevel;
  /** Mask pattern (0-7), chosen to optimize visual appearance */
  maskPattern: number;
  /** Target image to embed */
  image: ImageData;
  /** Rotation of QR code (0, 90, 180, 270 degrees) */
  rotation?: 0 | 90 | 180 | 270;
  /** Whether to dither the image */
  dither?: boolean;
  /** Contrast threshold for pixel importance */
  contrastThreshold?: number;
}

/**
 * A pixel in the QR code with its controllability status
 */
export interface QArtPixel {
  /** Row position (0-indexed) */
  row: number;
  /** Column position (0-indexed) */
  col: number;
  /** Whether this pixel is part of structural patterns (finder, timing, etc.) */
  isStructural: boolean;
  /** Whether this pixel is data (vs error correction) */
  isData: boolean;
  /** Bit index in the data stream (-1 if structural) */
  bitIndex: number;
  /** Whether we can control this pixel (after Gauss-Jordan elimination) */
  controllable: boolean;
  /** Target value from the image (true = dark, false = light) */
  targetValue: boolean;
  /** Importance weight based on image contrast */
  importance: number;
}

/**
 * A Reed-Solomon basis block
 * Each basis block controls one bit and its corresponding ECC bits
 */
export interface RSBasisBlock {
  /** Index of the data bit this block controls */
  dataBitIndex: number;
  /** The complete block data (data + ECC bytes) */
  blockData: Uint8Array;
  /** Bit positions in the QR code that this block affects */
  affectedPixels: number[];
}

/**
 * Result of QArt generation
 */
export interface QArtResult {
  /** Whether generation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** The generated QR code matrix */
  matrix?: boolean[][];
  /** Number of pixels that match the target image */
  matchingPixels: number;
  /** Total controllable pixels */
  totalControllable: number;
  /** Match percentage */
  matchPercentage: number;
  /** The modified data string (with optimized numeric fragment) */
  modifiedData?: string;
  /** Segments used for encoding */
  segments?: Array<{ data: string; mode: string }>;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Galois Field GF(2^8) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D)
 * Used for Reed-Solomon encoding
 */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

// Initialize Galois field tables
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  GF_LOG[0] = 255; // undefined, but set to max for safety
})();

// ============================================
// GALOIS FIELD ARITHMETIC
// ============================================

/**
 * Multiply two numbers in GF(2^8)
 */
export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/**
 * Add two numbers in GF(2^8) (same as XOR)
 */
export function gfAdd(a: number, b: number): number {
  return a ^ b;
}

/**
 * Compute the inverse of a number in GF(2^8)
 */
export function gfInv(a: number): number {
  if (a === 0) throw new Error('Cannot invert 0 in GF');
  return GF_EXP[255 - GF_LOG[a]];
}

// ============================================
// PIXEL MAPPING UTILITIES
// ============================================

/**
 * Get the module count for a QR version
 */
export function getModuleCount(version: number): number {
  return version * 4 + 17;
}

/**
 * Check if a position is part of a finder pattern
 */
export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  // Top-left finder
  if (row < 9 && col < 9) return true;
  // Top-right finder
  if (row < 9 && col >= moduleCount - 8) return true;
  // Bottom-left finder
  if (row >= moduleCount - 8 && col < 9) return true;
  return false;
}

/**
 * Check if a position is part of timing patterns
 */
export function isTimingPattern(row: number, col: number): boolean {
  return row === 6 || col === 6;
}

/**
 * Check if a position is part of an alignment pattern
 */
export function isAlignmentPattern(
  row: number,
  col: number,
  alignmentPositions: number[]
): boolean {
  for (const r of alignmentPositions) {
    for (const c of alignmentPositions) {
      // Skip if overlaps with finder patterns
      if (
        (r < 9 && c < 9) ||
        (r < 9 && c > alignmentPositions[alignmentPositions.length - 1] - 9)
      ) {
        continue;
      }
      if (row >= r - 2 && row <= r + 2 && col >= c - 2 && col <= c + 2) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Map an image to target pixel values for QArt generation
 */
export function mapImageToTargets(
  image: ImageData,
  moduleCount: number,
  threshold: number = 128
): { targets: boolean[][]; importance: number[][] } {
  const targets: boolean[][] = [];
  const importance: number[][] = [];

  const scaleX = image.width / moduleCount;
  const scaleY = image.height / moduleCount;

  for (let row = 0; row < moduleCount; row++) {
    targets[row] = [];
    importance[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      // Sample the center of each module
      const imgX = Math.floor((col + 0.5) * scaleX);
      const imgY = Math.floor((row + 0.5) * scaleY);
      const idx = (imgY * image.width + imgX) * 4;

      // Convert to grayscale
      const gray = (image.data[idx] + image.data[idx + 1] + image.data[idx + 2]) / 3;

      // Target is dark if gray is below threshold
      targets[row][col] = gray < threshold;

      // Importance based on how far from threshold (higher contrast = more important)
      importance[row][col] = Math.abs(gray - threshold) / 128;
    }
  }

  return { targets, importance };
}

// ============================================
// QART URL GENERATION
// ============================================

/**
 * Generate a QArt-compatible URL with numeric fragment
 * The numeric fragment can be manipulated to control pixel patterns
 *
 * @param baseUrl The base URL (e.g., "http://example.com/page")
 * @param numericLength Length of the numeric fragment to generate
 * @param seed Optional seed for deterministic generation
 */
export function generateQArtUrl(
  baseUrl: string,
  numericLength: number = 200,
  seed?: number
): string {
  // Simple pseudo-random number generator with seed
  let rng = seed ?? Date.now();
  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  // Generate random numeric string
  let numeric = '';
  for (let i = 0; i < numericLength; i++) {
    numeric += Math.floor(random() * 10).toString();
  }

  return `${baseUrl}#${numeric}`;
}

/**
 * Calculate the bit efficiency of using a numeric fragment
 * vs byte mode for the entire URL
 *
 * @param url The URL to analyze
 */
export function analyzeUrlEfficiency(url: string): {
  byteModeBits: number;
  mixedModeBits: number;
  savings: number;
  savingsPercent: number;
} {
  // Find the numeric fragment
  const hashIndex = url.indexOf('#');
  const numericFragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const isAllNumeric = /^\d+$/.test(numericFragment);

  // Byte mode: 8 bits per character
  const byteModeBits = url.length * 8 + 4 + 16; // +4 mode, +16 length (v10+)

  // Mixed mode
  let mixedModeBits = 0;
  if (hashIndex >= 0 && isAllNumeric && numericFragment.length >= 4) {
    // Byte segment for URL prefix
    const prefixLen = hashIndex + 1; // Include the #
    mixedModeBits += 4 + 16 + prefixLen * 8; // mode + length + data

    // Numeric segment for fragment
    const numLen = numericFragment.length;
    const numBits = Math.floor(numLen / 3) * 10 + (numLen % 3 === 2 ? 7 : numLen % 3 === 1 ? 4 : 0);
    mixedModeBits += 4 + 14 + numBits; // mode + length + data
  } else {
    mixedModeBits = byteModeBits;
  }

  const savings = byteModeBits - mixedModeBits;
  const savingsPercent = (savings / byteModeBits) * 100;

  return { byteModeBits, mixedModeBits, savings, savingsPercent };
}

// ============================================
// FUTURE: FULL QART ALGORITHM
// ============================================

/**
 * Build Reed-Solomon basis blocks for a given version and ECC level
 *
 * TODO: Implement full RS basis generation
 * - For each data bit position, create a block with that bit set to 1
 * - Compute the corresponding ECC bytes
 * - Store the complete block for later XOR operations
 */
export function buildRSBasis(_version: number, _ecc: ECCLevel): RSBasisBlock[] {
  // Placeholder - full implementation requires:
  // 1. Get RS block structure for version/ECC
  // 2. For each data bit, create basis block
  // 3. Compute ECC using polynomial division
  log.warn('buildRSBasis not yet implemented');
  return [];
}

/**
 * Apply Gauss-Jordan elimination to trade pixel control
 *
 * TODO: Implement Gauss-Jordan elimination
 * - Build matrix where rows are basis blocks, columns are pixels
 * - Prioritize pixels by importance (from image)
 * - Eliminate to isolate control over important pixels
 */
export function gaussJordanEliminate(
  _basis: RSBasisBlock[],
  _pixelImportance: number[]
): RSBasisBlock[] {
  // Placeholder - full implementation requires:
  // 1. Convert basis blocks to binary matrix
  // 2. Sort columns by pixel importance
  // 3. Perform row reduction
  // 4. Return modified basis
  log.warn('gaussJordanEliminate not yet implemented');
  return [];
}

/**
 * Generate a QArt code from configuration
 *
 * TODO: Implement full QArt generation
 */
export function generateQArt(_config: QArtConfig): QArtResult {
  log.warn('Full QArt generation not yet implemented');
  return {
    success: false,
    error:
      'QArt generation not yet implemented. Use mixed mode encoding for basic QArt URL support.',
    matchingPixels: 0,
    totalControllable: 0,
    matchPercentage: 0,
  };
}

// ============================================
// FRAGMENT SEARCH ALGORITHM
// ============================================

/**
 * Configuration for fragment search
 */
export interface FragmentSearchConfig {
  /** Base URL without fragment */
  baseUrl: string;
  /** Target image to match (as ImageData or canvas) */
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  /** Number of iterations to try */
  iterations: number;
  /** Length of numeric fragment (default: 8) */
  fragmentLength: number;
  /** Random seed for reproducibility */
  seed: number;
  /** QR version (1-40), 0 for auto */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Mask pattern (0-7 or -1 for auto) */
  maskPattern: number;
  /** Progress callback (called periodically with 0-100) */
  onProgress?: (percent: number) => void;
}

/**
 * Result of fragment search
 */
export interface FragmentSearchResult {
  /** The best fragment found */
  fragment: string;
  /** The complete URL with fragment */
  url: string;
  /** Match score (0-1) */
  score: number;
  /** Number of matching modules */
  matchingModules: number;
  /** Total controllable modules */
  totalControllable: number;
  /** Match percentage */
  matchPercentage: number;
}

/**
 * Alignment pattern positions for each QR version
 * Version 1 has no alignment patterns, version 2+ have alignment patterns
 */
const ALIGNMENT_POSITIONS: number[][] = [
  [], // Version 0 (invalid)
  [], // Version 1
  [6, 18], // Version 2
  [6, 22], // Version 3
  [6, 26], // Version 4
  [6, 30], // Version 5
  [6, 34], // Version 6
  [6, 22, 38], // Version 7
  [6, 24, 42], // Version 8
  [6, 26, 46], // Version 9
  [6, 28, 50], // Version 10
  [6, 30, 54], // Version 11
  [6, 32, 58], // Version 12
  [6, 34, 62], // Version 13
  [6, 26, 46, 66], // Version 14
  [6, 26, 48, 70], // Version 15
  [6, 26, 50, 74], // Version 16
  [6, 30, 54, 78], // Version 17
  [6, 30, 56, 82], // Version 18
  [6, 30, 58, 86], // Version 19
  [6, 34, 62, 90], // Version 20
  [6, 28, 50, 72, 94], // Version 21
  [6, 26, 50, 74, 98], // Version 22
  [6, 30, 54, 78, 102], // Version 23
  [6, 28, 54, 80, 106], // Version 24
  [6, 32, 58, 84, 110], // Version 25
  [6, 30, 58, 86, 114], // Version 26
  [6, 34, 62, 90, 118], // Version 27
  [6, 26, 50, 74, 98, 122], // Version 28
  [6, 30, 54, 78, 102, 126], // Version 29
  [6, 26, 52, 78, 104, 130], // Version 30
  [6, 30, 56, 82, 108, 134], // Version 31
  [6, 34, 60, 86, 112, 138], // Version 32
  [6, 30, 58, 86, 114, 142], // Version 33
  [6, 34, 62, 90, 118, 146], // Version 34
  [6, 30, 54, 78, 102, 126, 150], // Version 35
  [6, 24, 50, 76, 102, 128, 154], // Version 36
  [6, 28, 54, 80, 106, 132, 158], // Version 37
  [6, 32, 58, 84, 110, 136, 162], // Version 38
  [6, 26, 54, 82, 110, 138, 166], // Version 39
  [6, 30, 58, 86, 114, 142, 170], // Version 40
];

/**
 * Get alignment pattern positions for a version
 */
function getAlignmentPositionsForVersion(version: number): number[] {
  if (version < 1 || version > 40) return [];
  return ALIGNMENT_POSITIONS[version] || [];
}

/**
 * Check if a URL can use fragment search (must be a valid URL)
 */
export function canUseFragmentSearch(content: string): boolean {
  // Check if content looks like a URL
  try {
    // Try to parse as URL
    if (content.startsWith('http://') || content.startsWith('https://')) {
      new URL(content);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the base URL without fragment
 */
export function getBaseUrl(url: string): string {
  const hashIndex = url.indexOf('#');
  return hashIndex >= 0 ? url.substring(0, hashIndex) : url;
}

// Import and re-export mapImageToTargetsSupersampled from image-utils to avoid circular imports
import { mapImageToTargetsSupersampled } from '../../domain/qr/qart/image-utils';
export { mapImageToTargetsSupersampled } from '../../domain/qr/qart/image-utils';

/**
 * Evaluate how well a QR code matches the target image
 * Returns a score from 0 to 1, where 1 is a perfect match
 */
function isEvalStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  alignmentPositions: number[]
): boolean {
  return (
    isFinderPattern(row, col, moduleCount) ||
    isTimingPattern(row, col) ||
    isAlignmentPattern(row, col, alignmentPositions)
  );
}

export function evaluateQRMatch(
  qrIsDark: (row: number, col: number) => boolean,
  moduleCount: number,
  version: number,
  targets: boolean[][],
  importance: number[][]
): { score: number; matchingModules: number; totalControllable: number } {
  let weightedMatch = 0;
  let totalWeight = 0;
  let matchingModules = 0;
  let totalControllable = 0;

  const alignmentPositions = getAlignmentPositionsForVersion(version);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isEvalStructuralModule(row, col, moduleCount, alignmentPositions)) continue;

      // This is a controllable (data/ECC) module
      totalControllable++;
      const weight = importance[row]?.[col] ?? 0.5;
      totalWeight += weight;

      const qrValue = qrIsDark(row, col);
      const targetValue = targets[row]?.[col] ?? false;

      if (qrValue === targetValue) {
        weightedMatch += weight;
        matchingModules++;
      }
    }
  }

  const score = totalWeight > 0 ? weightedMatch / totalWeight : 0;
  return { score, matchingModules, totalControllable };
}

/**
 * Generate a random numeric fragment
 */
function generateRandomFragment(length: number, rng: () => number): string {
  let fragment = '';
  for (let i = 0; i < length; i++) {
    fragment += Math.floor(rng() * 10).toString();
  }
  return fragment;
}

/**
 * Create a seeded random number generator
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

interface FragmentSearchState {
  targets: boolean[][] | null;
  importance: number[][] | null;
  cachedModuleCount: number;
  bestFragment: string;
  bestScore: number;
  bestMatchingModules: number;
  bestTotalControllable: number;
}

function tryFragmentCandidate(
  baseUrl: string,
  fragment: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number,
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas,
  state: FragmentSearchState,
  iterationIndex: number
): void {
  const testUrl = `${baseUrl}#${fragment}`;
  const qr = qrcode(version, ecc);
  qr.addData(testUrl);
  qr.make(maskPattern >= 0 ? maskPattern : undefined);

  const moduleCount = qr.getModuleCount();

  if (!state.targets || moduleCount !== state.cachedModuleCount) {
    const mapped = mapImageToTargetsSupersampled(targetImage, moduleCount);
    state.targets = mapped.targets;
    state.importance = mapped.importance;
    state.cachedModuleCount = moduleCount;
  }

  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);
  const { score, matchingModules, totalControllable } = evaluateQRMatch(
    (row, col) => qr.isDark(row, col),
    moduleCount,
    actualVersion,
    state.targets!,
    state.importance!
  );

  if (score > state.bestScore) {
    state.bestScore = score;
    state.bestFragment = fragment;
    state.bestMatchingModules = matchingModules;
    state.bestTotalControllable = totalControllable;

    log.debug('New best fragment', {
      fragment,
      score: `${(score * 100).toFixed(1)}%`,
      iteration: iterationIndex,
    });
  }
}

/**
 * Search for the best numeric fragment to match the target image
 * Uses batch processing to keep the UI responsive
 */
export async function searchBestFragment(
  config: FragmentSearchConfig
): Promise<FragmentSearchResult> {
  const {
    baseUrl,
    targetImage,
    iterations,
    fragmentLength,
    seed,
    version,
    ecc,
    maskPattern,
    onProgress,
  } = config;

  const rng = createSeededRandom(seed);

  const state: FragmentSearchState = {
    targets: null,
    importance: null,
    cachedModuleCount: 0,
    bestFragment: '',
    bestScore: -1,
    bestMatchingModules: 0,
    bestTotalControllable: 0,
  };

  const batchSize = 50;
  const totalBatches = Math.ceil(iterations / batchSize);

  log.debug('Starting fragment search', { iterations, fragmentLength, baseUrl });

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, iterations);

    for (let i = batchStart; i < batchEnd; i++) {
      const fragment = generateRandomFragment(fragmentLength, rng);
      try {
        tryFragmentCandidate(baseUrl, fragment, version, ecc, maskPattern, targetImage, state, i);
      } catch (err) {
        log.trace('Fragment caused encoding error', { fragment, error: err });
      }
    }

    if (onProgress) {
      const percent = Math.round(((batch + 1) / totalBatches) * 100);
      onProgress(percent);
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const result: FragmentSearchResult = {
    fragment: state.bestFragment,
    url: `${baseUrl}#${state.bestFragment}`,
    score: state.bestScore,
    matchingModules: state.bestMatchingModules,
    totalControllable: state.bestTotalControllable,
    matchPercentage:
      state.bestTotalControllable > 0
        ? (state.bestMatchingModules / state.bestTotalControllable) * 100
        : 0,
  };

  log.info('Fragment search complete', {
    bestFragment: state.bestFragment,
    score: `${(state.bestScore * 100).toFixed(1)}%`,
    matchPercentage: `${result.matchPercentage.toFixed(1)}%`,
    iterations,
  });

  return result;
}

// ============================================
// FULL QART ALGORITHM IMPORTS
// ============================================

// Re-export from new modules
export {
  type BitPixelMapping,
  buildBitPixelMap,
  buildBitToMappingMap,
  buildPixelToBitMap,
  clearBitMappingCache,
  getDataPixelIndices,
  getModuleCount as getBitMappingModuleCount,
  getRSBlockInfo,
  getTotalCodewords,
  getTotalDataBytes,
  indexToPixel,
  pixelToIndex,
  type RSBlockInfo,
} from '../../domain/qr/qart/bit-mapping';
export {
  applyAllSelectedVectors,
  applySelectedVectorsToBlock,
  type BlockEliminationResult,
  type BlockSelectionResult,
  countMatchingPixels,
  type EliminationResult,
  gaussJordanEliminate as performGaussJordanElimination,
  rankPixelsByImportance,
  selectBasisVectorsForTarget,
} from '../../domain/qr/qart/elimination';
export { clearQArtBufferPool } from '../../domain/qr/qart/buffer-pool';
export {
  eccNumericToLevel,
  // Format info utilities
  extractFormatInfo,
  extractMaskFromMatrix,
  type FormatVerificationResult,
  type FullQArtConfig,
  type QArtPerformanceProfile,
  type FullQArtResult,
  generateFullQArt,
  generateFullQArtBestMask,
  generateFullQArtBestRotation,
  generateFullQArtOptimal,
  matrixToQRLike,
  type RejectionReason,
  readFormatInfoFromDecoder,
  type SemanticValidationResult,
  VALID_SUFFIX_CHARS,
  // Suffix charset validation
  validateSuffixCharset,
  verifyMatrixFormatInfo,
} from '../../domain/qr/qart/generate';
export {
  basisToMatrix,
  buildBlockBasis,
  buildFullBasis,
  calculateOptimalVersionAndSuffix,
  clearBasisCache,
  computeECC,
  generateDeterministicNumericSuffix,
  generateDeterministicSuffix,
  getCachedBasis,
  hashStringToSeed,
  // Suffix and capacity configuration
  MIN_ECC_HEADROOM_BYTES,
  MIN_QART_VERSION,
  type RSBasis,
  type RSBasisVector,
  xorBasisVectors,
} from '../../domain/qr/qart/rs-basis';
export {
  binarySearchMaxVectors,
  flattenAndOrderSelections,
  type RejectionHistogram,
  unflattenSelections,
} from '../../domain/qr/qart/scan-fallback';
export {
  generateQArtInWorker,
  terminateQArtWorker,
} from '../../platform/worker/qart/worker-client';

// ============================================
// EXPORTS
// ============================================

export default {
  // Types are exported above

  // Galois field operations
  gfMul,
  gfAdd,
  gfInv,

  // Pixel mapping
  getModuleCount,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  mapImageToTargets,
  mapImageToTargetsSupersampled,

  // URL utilities
  generateQArtUrl,
  analyzeUrlEfficiency,
  canUseFragmentSearch,
  getBaseUrl,

  // Fragment search (basic approach)
  searchBestFragment,
  evaluateQRMatch,

  // Full QArt algorithm (advanced)
  // Note: Use the named exports above for full QArt functionality
  buildRSBasis,
  gaussJordanEliminate,
  generateQArt,
};
