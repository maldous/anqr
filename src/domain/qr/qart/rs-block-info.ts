export interface RSBlockInfo {
  /** Index of this RS block */
  blockIndex: number;
  /** Number of data bytes in this block */
  dataCount: number;
  /** Number of ECC bytes in this block */
  eccCount: number;
  /** Total bytes (data + ECC) */
  totalCount: number;
}
