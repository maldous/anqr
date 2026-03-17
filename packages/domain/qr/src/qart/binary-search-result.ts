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
