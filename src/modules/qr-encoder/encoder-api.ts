/**
 * QR Encoder Utilities
 * Provides QR encoding helper functions including multi-segment mixed mode encoding
 */

import { createLogger } from '../../lib/logger';
import { qrcode } from './encoder';
import type { QRErrorCorrectionLevelChar } from './types';

const _log = createLogger('ENCODER');

// Type aliases for QR encoding
export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
export type EncodingMode = 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed';
export type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | -1;

export interface QROptions {
  errorCorrectionLevel?: ECCLevel;
  version?: number;
  maskPattern?: MaskPattern;
  mode?: EncodingMode;
}

export interface QRMatrix {
  modules: boolean[][];
  size: number;
  version: number;
}

export interface QRInstance {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  make(maskPattern?: number): void;
  addData(data: string, mode?: string): void;
}

/**
 * Data segment for multi-segment encoding
 * Allows mixing different encoding modes in a single QR code
 */
export interface DataSegment {
  data: string;
  mode: 'numeric' | 'alphanumeric' | 'byte' | 'kanji';
}

/**
 * Check if a character is numeric (0-9)
 */
function isNumeric(char: string): boolean {
  return /^[0-9]$/.test(char);
}

/**
 * Check if a character is alphanumeric (0-9, A-Z, space, $%*+-./:)
 */
function isAlphanumeric(char: string): boolean {
  return /^[0-9A-Z $%*+\-./:]$/.test(char);
}

/**
 * Optimize a string into segments using the most efficient encoding modes.
 * This is crucial for QArt codes which use numeric fragments in URLs.
 *
 * Algorithm:
 * - Scan through the string detecting runs of numeric, alphanumeric, or byte characters
 * - Use numeric mode for runs of digits (3.33 bits/char)
 * - Use alphanumeric mode for runs of alphanumeric chars (5.5 bits/char)
 * - Use byte mode for everything else (8 bits/char)
 *
 * Minimum run lengths for mode switching (approximate thresholds):
 * - Numeric: 4+ digits to be worth switching
 * - Alphanumeric: 6+ chars to be worth switching from byte
 */
export function optimizeSegments(text: string): DataSegment[] {
  if (!text || text.length === 0) {
    return [];
  }

  const segments: DataSegment[] = [];
  let i = 0;

  while (i < text.length) {
    // Try to find a numeric run (minimum 4 digits for efficiency)
    const numericStart = i;
    while (i < text.length && isNumeric(text[i])) {
      i++;
    }
    const numericLen = i - numericStart;

    if (numericLen >= 4) {
      // Worth using numeric mode
      segments.push({ data: text.slice(numericStart, i), mode: 'numeric' });
      continue;
    }

    // Reset if numeric run was too short
    i = numericStart;

    // Try to find an alphanumeric run (minimum 6 chars, uppercase only)
    const alphaStart = i;
    const upperText = text.toUpperCase();
    while (i < text.length && isAlphanumeric(upperText[i]) && text[i] === upperText[i]) {
      i++;
    }
    const alphaLen = i - alphaStart;

    if (alphaLen >= 6) {
      // Worth using alphanumeric mode
      segments.push({ data: text.slice(alphaStart, i), mode: 'alphanumeric' });
      continue;
    }

    // Reset if alphanumeric run was too short
    i = alphaStart;

    // Collect bytes until we hit a potential numeric/alphanumeric run
    const byteStart = i;
    while (i < text.length) {
      // Look ahead for numeric run
      let numAhead = 0;
      let j = i;
      while (j < text.length && isNumeric(text[j])) {
        numAhead++;
        j++;
      }
      if (numAhead >= 4) break;

      // Look ahead for alphanumeric run (uppercase)
      let alphaAhead = 0;
      j = i;
      while (j < text.length && isAlphanumeric(upperText[j]) && text[j] === upperText[j]) {
        alphaAhead++;
        j++;
      }
      if (alphaAhead >= 6) break;

      i++;
    }

    if (i > byteStart) {
      segments.push({ data: text.slice(byteStart, i), mode: 'byte' });
    }
  }

  // Merge adjacent segments of the same mode
  const merged: DataSegment[] = [];
  for (const seg of segments) {
    if (merged.length > 0 && merged[merged.length - 1].mode === seg.mode) {
      merged[merged.length - 1].data += seg.data;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}

/**
 * Calculate the approximate bit length for segments at a given version
 * Used for capacity checking
 */
export function calculateSegmentBits(segments: DataSegment[], version: number): number {
  let bits = 0;
  const lengthBitsTable = {
    numeric: version < 10 ? 10 : version < 27 ? 12 : 14,
    alphanumeric: version < 10 ? 9 : version < 27 ? 11 : 13,
    byte: version < 10 ? 8 : 16,
    kanji: version < 10 ? 8 : version < 27 ? 10 : 12,
  };

  for (const seg of segments) {
    // Mode indicator: 4 bits
    bits += 4;
    // Character count indicator
    bits += lengthBitsTable[seg.mode];
    // Data bits
    switch (seg.mode) {
      case 'numeric':
        // 10 bits per 3 digits, 7 bits for 2 remaining, 4 bits for 1 remaining
        bits += Math.floor(seg.data.length / 3) * 10;
        if (seg.data.length % 3 === 2) bits += 7;
        else if (seg.data.length % 3 === 1) bits += 4;
        break;
      case 'alphanumeric':
        // 11 bits per 2 chars, 6 bits for 1 remaining
        bits += Math.floor(seg.data.length / 2) * 11;
        if (seg.data.length % 2 === 1) bits += 6;
        break;
      case 'byte':
        bits += seg.data.length * 8;
        break;
      case 'kanji':
        bits += seg.data.length * 13; // Approximate
        break;
    }
  }

  return bits;
}

function toEncoderModeToken(
  mode: EncodingMode | 'numeric' | 'alphanumeric' | 'byte' | 'kanji',
  content: string
): string | undefined {
  // For explicit segment modes, use directly
  if (mode === 'numeric') return 'Numeric';
  if (mode === 'alphanumeric') return 'Alphanumeric';
  if (mode === 'kanji') return 'Kanji';
  if (mode === 'byte') return 'Byte';

  const compatible = getCompatibleMode(content, mode);
  switch (compatible) {
    case 'numeric':
      return 'Numeric';
    case 'alphanumeric':
      return 'Alphanumeric';
    case 'kanji':
      return 'Kanji';
    default:
      return 'Byte';
  }
}

/**
 * Create a QR code instance with multiple data segments (mixed mode encoding)
 * This is essential for reproducing QArt codes efficiently
 */
export function createQRInstanceWithSegments(
  segments: DataSegment[],
  errorCorrectionLevel: ECCLevel = 'M',
  version: number = 0,
  options: Pick<QROptions, 'maskPattern'> = {}
): QRInstance {
  const typeNumber = version === 0 ? 0 : version;
  const qr = qrcode(
    typeNumber,
    errorCorrectionLevel as QRErrorCorrectionLevelChar
  ) as unknown as QRInstance;

  // Add each segment with its specific mode
  for (const segment of segments) {
    const modeToken = toEncoderModeToken(segment.mode, segment.data);
    qr.addData(segment.data, modeToken);
  }

  const mask = options.maskPattern;
  const maskPattern = typeof mask === 'number' && mask >= 0 && mask <= 7 ? mask : undefined;
  qr.make(maskPattern);

  return qr;
}

/**
 * Create a QR code instance
 * When mode is 'mixed' or 'auto', automatically optimizes into multiple segments
 * for maximum encoding efficiency (crucial for QArt URL patterns)
 */
export function createQRInstance(
  data: string,
  errorCorrectionLevel: ECCLevel = 'M',
  version: number = 0,
  options: Pick<QROptions, 'mode' | 'maskPattern'> = {}
): QRInstance {
  // Use mixed mode optimization for 'mixed' or 'auto' modes
  if (options.mode === 'mixed' || options.mode === 'auto') {
    const segments = optimizeSegments(data);
    // Only use multi-segment if we found multiple segments or numeric optimization
    if (segments.length > 1 || (segments.length === 1 && segments[0].mode !== 'byte')) {
      return createQRInstanceWithSegments(segments, errorCorrectionLevel, version, options);
    }
  }

  const typeNumber = version === 0 ? 0 : version;
  const qr = qrcode(
    typeNumber,
    errorCorrectionLevel as QRErrorCorrectionLevelChar
  ) as unknown as QRInstance;

  const modeToken =
    options.mode && options.mode !== 'mixed' ? toEncoderModeToken(options.mode, data) : undefined;
  qr.addData(data, modeToken);

  const mask = options.maskPattern;
  const maskPattern = typeof mask === 'number' && mask >= 0 && mask <= 7 ? mask : undefined;
  qr.make(maskPattern);

  return qr;
}

/**
 * Generate QR code matrix
 */
export function generateQR(data: string, options: QROptions = {}): QRMatrix {
  const ecc = options.errorCorrectionLevel ?? 'M';
  const version = options.version ?? 0;
  const instance = createQRInstance(data, ecc, version, {
    mode: options.mode,
    maskPattern: options.maskPattern,
  });
  const size = instance.getModuleCount();

  const modules: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = [];
    for (let col = 0; col < size; col++) {
      rowData.push(instance.isDark(row, col));
    }
    modules.push(rowData);
  }

  const actualVersion = Math.floor((size - 17) / 4);

  return {
    modules,
    size,
    version: actualVersion,
  };
}

/**
 * Get compatible encoding mode for content
 * Validates that the requested mode can encode the content, falls back to 'byte' if not
 */
export function getCompatibleMode(content: string, requestedMode: string): string {
  if (requestedMode === 'auto') {
    // Auto-detect the best mode
    if (/^[0-9]+$/.test(content)) return 'numeric';
    if (/^[0-9A-Z $%*+\-./:']+$/.test(content)) return 'alphanumeric';
    return 'byte';
  }

  // Validate that requested mode can encode the content
  switch (requestedMode) {
    case 'numeric':
      if (/^[0-9]+$/.test(content)) return 'numeric';
      break;
    case 'alphanumeric':
      if (/^[0-9A-Z $%*+\-./:']+$/.test(content)) return 'alphanumeric';
      break;
    case 'kanji':
      // For kanji, fall through to byte if content has non-kanji chars
      return 'kanji';
    case 'byte':
      return 'byte';
  }

  // Fall back to byte mode if requested mode can't encode content
  return 'byte';
}

/**
 * Calculate optimal version for data
 *
 * IMPORTANT: Do NOT pass mode: 'auto' here! The qr-generator-class.ts uses
 * undefined mode which defaults to byte encoding. If we use 'auto' here,
 * it triggers optimizeSegments() for mixed-mode encoding which is more
 * efficient, causing version calculation to pick a smaller version than
 * what the actual QR generation needs (which uses byte mode).
 */
export function calculateOptimalVersion(
  data: string,
  errorCorrectionLevel: ECCLevel = 'M'
): number {
  // Try each version until one fits
  // Note: We intentionally don't pass mode option - this matches the behavior
  // in qr-generator-class.ts which uses undefined mode (defaults to byte)
  for (let v = 1; v <= 40; v++) {
    try {
      createQRInstance(data, errorCorrectionLevel, v);
      return v;
    } catch {
      // Version too small, try next
    }
  }
  return 40; // Max version
}
