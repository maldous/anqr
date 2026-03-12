/**
 * Represents the mapping of a single bit to its pixel position
 */
export interface BitPixelMapping {
  /** Global bit index in the final interleaved data stream */
  globalBitIndex: number;
  /** Byte index in the final interleaved stream */
  byteIndex: number;
  /** Bit position within the byte (7 = MSB, 0 = LSB) */
  bitInByte: number;
  /** QR module row position */
  row: number;
  /** QR module column position */
  col: number;
  /** Whether this is a data byte (true) or ECC byte (false) */
  isData: boolean;
  /** Which RS block this byte belongs to */
  rsBlockIndex: number;
  /** Position of the byte within its RS block */
  posInBlock: number;
  /** Linear pixel index (row * moduleCount + col) */
  pixelIndex: number;
}

/**
 * Information about the RS block structure for a version/ECC combo
 */
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

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
