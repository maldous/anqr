import type { RSBasisVector } from './rs-basis';
export type { EliminationResult } from './elimination-result';
export type { BlockSelectionResult } from './block-selection-result';

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
