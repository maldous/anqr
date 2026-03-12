import type { RSBasisVector } from './rs-basis';

/**
 * Result of Gauss-Jordan elimination for a single RS block
 */
export interface BlockEliminationResult {
  /** RS block index */
  blockIndex: number;
  /** Eliminated basis vectors for this block */
  vectors: RSBasisVector[];
  /** Map from pixel index to the vector index within this block */
  pixelToVectorIndex: Map<number, number>;
  /** Number of pixels this block can control */
  controllablePixels: number;
  /** Pixels controlled by this block */
  controlledPixels: number[];
}

/**
 * Result of Gauss-Jordan elimination across all blocks
 */
export interface EliminationResult {
  /** Per-block elimination results */
  blockResults: BlockEliminationResult[];
  /** Eliminated basis vectors (all blocks combined, in original order) */
  vectors: RSBasisVector[];
  /** Map from pixel index to { blockIndex, vectorIndex } */
  pixelToVector: Map<number, { blockIndex: number; vectorIndex: number }>;
  /** Total number of pixels we can control */
  controllablePixels: number;
  /** All pixels we control */
  controlledPixels: number[];
}

/**
 * Selection result for a single RS block
 */
export interface BlockSelectionResult {
  blockIndex: number;
  selectedVectorIndices: number[];
}
