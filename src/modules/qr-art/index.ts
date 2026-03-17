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
import { buildRSBasis } from "./build-rs-basis";
import { evaluateQRMatch, searchBestFragment } from "./fragment-search";
import { gfAdd, gfInv, gfMul } from "./gf-utils";
import { gaussJordanEliminate } from "./gauss-jordan-eliminate";
import { generateQArt } from "./generate-qart";
import {
  getModuleCount,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
  mapImageToTargets,
} from "./pixel-mapping";
import {
  analyzeUrlEfficiency,
  canUseFragmentSearch,
  generateQArtUrl,
  getBaseUrl,
} from "./url-utils";
import { mapImageToTargetsSupersampled } from "../../domain/qr/qart/image-utils";

// ============================================
// TYPES
// ============================================

// ============================================
// QART URL GENERATION
// ============================================

// ============================================
// FUTURE: FULL QART ALGORITHM
// ============================================

/**
 * Build Reed-Solomon basis blocks for a given version and ECC level
 *
 * RS basis generation delegates to the build-rs-basis module.
 * - For each data bit position, create a block with that bit set to 1
 * - Compute the corresponding ECC bytes
 * - Store the complete block for later XOR operations
 */

/**
 * Apply Gauss-Jordan elimination to trade pixel control
 *
 * Gauss-Jordan elimination delegates to the gauss-jordan-eliminate module.
 * - Build matrix where rows are basis blocks, columns are pixels
 * - Prioritize pixels by importance (from image)
 * - Eliminate to isolate control over important pixels
 */

/**
 * Generate a QArt code from configuration
 *
 * Full QArt generation delegates to the generate-qart module.
 */

// ============================================
// FRAGMENT SEARCH ALGORITHM
// ============================================

/**
 * Alignment pattern positions for each QR version
 * Version 1 has no alignment patterns, version 2+ have alignment patterns
 */
/**
 * Check if a URL can use fragment search (must be a valid URL)
 */
// Import and re-export mapImageToTargetsSupersampled from image-utils to avoid circular imports
export { mapImageToTargetsSupersampled } from "../../domain/qr/qart/image-utils";
export { evaluateQRMatch, searchBestFragment } from "./fragment-search";
export { gfAdd, gfInv, gfMul } from "./gf-utils";
export {
  getModuleCount,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
  mapImageToTargets,
} from "./pixel-mapping";
export {
  analyzeUrlEfficiency,
  canUseFragmentSearch,
  generateQArtUrl,
  getBaseUrl,
} from "./url-utils";
export { buildRSBasis } from "./build-rs-basis";
export { gaussJordanEliminate } from "./gauss-jordan-eliminate";
export { generateQArt } from "./generate-qart";

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
} from "../../domain/qr/qart/bit-mapping";
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
} from "../../domain/qr/qart/elimination";
export { clearQArtBufferPool } from "../../domain/qr/qart/buffer-pool";
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
} from "../../domain/qr/qart/generate";
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
} from "../../domain/qr/qart/rs-basis";
export {
  binarySearchMaxVectors,
  flattenAndOrderSelections,
  type RejectionHistogram,
  unflattenSelections,
} from "../../domain/qr/qart/scan-fallback";
export {
  generateQArtInWorker,
  terminateQArtWorker,
} from "../../platform/worker/qart/worker-client";
export type {
  FragmentSearchConfig,
  FragmentSearchResult,
  QArtConfig,
  QArtPixel,
  QArtResult,
  RSBasisBlock,
} from "./types";

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
