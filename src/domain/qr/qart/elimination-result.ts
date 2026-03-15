import type { BlockEliminationResult } from './block-elimination-result';
import type { RSBasisVector } from './rs-basis';

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
