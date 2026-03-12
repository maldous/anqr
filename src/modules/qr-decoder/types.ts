/**
 * QR Decoder Types
 * Our own QR code decoding types - no external dependencies
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('DECODER');

export interface Point {
  x: number;
  y: number;
}

export interface FinderPattern {
  center: Point;
  moduleSize: number;
  count: number;
}

export interface FinderPatternResult {
  patterns: FinderPattern[];
  threshold: number;
}

export interface QRLocation {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
  moduleSize: number;
  moduleCount: number;
}

export interface FormatInfo {
  eccLevel: number; // 0=M, 1=L, 2=H, 3=Q
  maskPattern: number; // 0-7
}

/**
 * Raw decoder metadata for debugging - contains everything decoded.
 * This is the authoritative source of truth for all QR code parameters.
 */
export interface DecoderMetadata {
  /** QR Code version (1-40) from format/version info, or null if not detected */
  version: number | null;
  /** Mask pattern (0-7) from format info, or null if not detected */
  maskPattern: number | null;
  /** Error correction level from format info */
  eccLevel: 'L' | 'M' | 'Q' | 'H' | null;
  /** Number of errors corrected by RS decoder */
  errorsCorrected: number | null;
  /** Number of erasures corrected by RS decoder */
  erasures: number | null;
  /** Total number of bits in the raw data */
  numBits: number | null;
  /** Orientation in degrees (0-360), if detected */
  orientation: number | null;
  /** Structured append sequence number (-1 if not structured append) */
  structuredAppendSequence: number | null;
  /** Structured append parity (-1 if not structured append) */
  structuredAppendParity: number | null;
  /** Whether this is part of a structured append sequence */
  hasStructuredAppend: boolean;
  /** Raw byte segments from the decoder */
  byteSegmentCount: number;
  /** Total bytes across all segments */
  totalByteLength: number;
}

export interface DecodeResult {
  success: boolean;
  data: string | null;
  /** Raw payload bytes, concatenated across segments (best-effort). */
  dataBytes?: Uint8Array | null;
  error: string | null;
  location: {
    topLeftCorner: Point;
    topRightCorner: Point;
    bottomLeftCorner: Point;
    bottomRightCorner: Point;
  } | null;
  /** QR Code version (1-40) - from decoder metadata, not estimated */
  version: number | null;
  eccLevel: 'L' | 'M' | 'Q' | 'H' | null;
  /** Mask pattern (0-7) - from decoder metadata, not estimated */
  maskPattern: number | null;
  /** Detected encoding mode from segments. */
  encodingMode?: 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' | null;
  /** Number of byte errors corrected by Reed-Solomon decoder. */
  errorsCorrected?: number | null;
  /** Number of erasures corrected */
  erasures?: number | null;
  /** Orientation in degrees (0-360) */
  orientation?: number | null;
  /** Total number of bits in raw data */
  numBits?: number | null;
  /** Structured append sequence number */
  structuredAppendSequence?: number | null;
  /** Structured append parity */
  structuredAppendParity?: number | null;
  /** Complete decoder metadata for debugging - authoritative source of truth */
  decoderMetadata?: DecoderMetadata;
  /** Whether the decode was structurally valid (no truncated/fake segments after primary) */
  structurallyValid?: boolean;
  /** Number of segments decoded (including terminator if found) */
  segmentCount?: number;
  /** Array of segment info for each decoded segment */
  segments?: DecodedSegmentInfo[];
}

export type ECCLevelChar = 'L' | 'M' | 'Q' | 'H';

/**
 * Information about a single decoded segment.
 * Used to detect fake/truncated segments after the primary data.
 */
export interface DecodedSegmentInfo {
  /** Segment index (0-based) */
  index: number;
  /** Mode indicator nibble (0-15) */
  mode: number;
  /** Mode name for debugging */
  modeName: 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'eci' | 'terminator' | 'unknown';
  /** Character count from header */
  charCount: number;
  /** Actual characters/bytes decoded */
  decodedLength: number;
  /** Whether this segment decoded without truncation */
  valid: boolean;
  /** Bit offset where this segment started */
  bitOffset: number;
}

// ECC level mapping (from format info bits)
export const ECC_LEVEL_MAP: Record<number, ECCLevelChar> = {
  0: 'M',
  1: 'L',
  2: 'H',
  3: 'Q',
};

// Mode indicators (4 bits)
export const MODE_NUMERIC = 0b0001;
export const MODE_ALPHANUMERIC = 0b0010;
export const MODE_BYTE = 0b0100;
export const MODE_KANJI = 0b1000;
export const MODE_ECI = 0b0111;
export const MODE_TERMINATOR = 0b0000;

// Alphanumeric character set
export const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
