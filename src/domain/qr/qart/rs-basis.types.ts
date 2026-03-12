import { type ECCLevel, type RSBlockInfo } from './bit-mapping';

/**
 * A single RS basis vector
 * Represents setting one bit to 1 and its effect on the codeword
 */
export interface RSBasisVector {
  /** Which data bit this vector controls (global index) */
  dataBitIndex: number;
  /** Which RS block this belongs to */
  rsBlockIndex: number;
  /** Position within the RS block (byte index) */
  posInBlock: number;
  /** Which bit within the byte (0-7, 7=MSB) */
  bitInByte: number;
  /** The complete block data (data + ECC) as a bit vector */
  blockBits: Uint8Array;
  /** Affected pixel indices (will be filled during mapping) */
  affectedPixels: number[];
  /** After elimination: which pixel this primarily controls (-1 if none) */
  pivotPixel: number;
  /** Sparse representation of blockBits (byte indices with non-zero values) */
  nonZeroByteIndices?: Uint16Array;
  /** Sparse representation values corresponding to nonZeroByteIndices */
  nonZeroByteValues?: Uint8Array;
}

/**
 * Complete RS basis for a version/ECC combination
 */
export interface RSBasis {
  version: number;
  ecc: ECCLevel;
  blocks: RSBlockInfo[];
  vectors: RSBasisVector[];
  totalDataBits: number;
  totalEccBits: number;
}

/**
 * Information about QR-Art capacity for a given configuration
 */
export interface QRArtCapacityInfo {
  /** QR version being used */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Total data bits in all RS blocks */
  totalDataBits: number;
  /** Number of bits that are protected (header + content) */
  protectedBits: number;
  /** Number of bits available for QR-Art manipulation */
  controllableBits: number;
  /** Percentage of data bits that can be controlled */
  controlPercentage: number;
  /** How the protection is configured */
  protectionMode: 'header-only' | 'full-content';
  /** Breakdown of protected bits */
  breakdown: {
    headerBits: number;
    dataBits: number;
    terminatorBits: number;
    paddingBits: number;
  };
}

/**
 * Result of calculating optimal version and suffix for QR-Art
 */
export interface OptimalVersionAndSuffix {
  /** Recommended QR version */
  version: number;
  /** Recommended suffix length (characters) */
  suffixLength: number;
  /** Total data bytes capacity of this version */
  totalCapacity: number;
  /** Expected control percentage with this suffix */
  expectedControlPercent: number;
  /** Whether version was upgraded from minimum */
  versionUpgraded: boolean;
  /** Original minimum version that fits the data */
  originalVersion: number;
  /** Number of padding bytes available (in addition to suffix) */
  paddingBytes: number;
  /** Controllable bits from suffix */
  suffixBits: number;
  /** Controllable bits from padding */
  paddingBits: number;
}
