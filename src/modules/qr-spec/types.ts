/**
 * QR Specification Types
 * Core QR code types and constants per ISO/IEC 18004
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('SPEC');

// ============================================
// ERROR CORRECTION LEVELS
// ============================================

/** Error correction level character */
export type ECCLevel = 'L' | 'M' | 'Q' | 'H';

/** Error correction level internal numeric representation */
export const QRErrorCorrectionLevel = {
  L: 1, // ~7% recovery
  M: 0, // ~15% recovery
  Q: 3, // ~25% recovery
  H: 2, // ~30% recovery
} as const;

export type QRErrorCorrectionLevelType =
  (typeof QRErrorCorrectionLevel)[keyof typeof QRErrorCorrectionLevel];

/** Map from internal numeric to character */
export const ECC_LEVEL_MAP: Record<number, ECCLevel> = {
  0: 'M',
  1: 'L',
  2: 'H',
  3: 'Q',
};

// ============================================
// ENCODING MODES
// ============================================

/** QR encoding mode indicators (4-bit) */
export const QRMode = {
  MODE_NUMBER: 1, // 0001 - Numeric
  MODE_ALPHA_NUM: 1 << 1, // 0010 - Alphanumeric
  MODE_8BIT_BYTE: 1 << 2, // 0100 - Byte
  MODE_KANJI: 1 << 3, // 1000 - Kanji
} as const;

export type QRModeType = (typeof QRMode)[keyof typeof QRMode];

/** Mode indicator values for decoder */
export const MODE_NUMERIC = 0b0001;
export const MODE_ALPHANUMERIC = 0b0010;
export const MODE_BYTE = 0b0100;
export const MODE_KANJI = 0b1000;
export const MODE_TERMINATOR = 0b0000;

export type EncodingMode = 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji';

// ============================================
// MASK PATTERNS
// ============================================

/** Mask pattern constants (0-7) */
export const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
} as const;

export type QRMaskPatternType = (typeof QRMaskPattern)[keyof typeof QRMaskPattern];
export type MaskPattern = 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
