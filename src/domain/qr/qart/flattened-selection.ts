import type { RSBasisVector } from './rs-basis';

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
