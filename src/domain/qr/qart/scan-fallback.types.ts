import type { RSBasisVector } from './rs-basis';

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
