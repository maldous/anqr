/**
 * QR Decoder Types
 * Our own QR code decoding types - no external dependencies
 */

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
  version: number | null;
  eccLevel: 'L' | 'M' | 'Q' | 'H' | null;
  maskPattern: number | null;
  /** Detected encoding mode from segments. */
  encodingMode?: 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' | null;
}

export type ECCLevelChar = 'L' | 'M' | 'Q' | 'H';

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
