/**
 * QR Encoder Types and Constants
 * Core constants for QR code generation
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ENCODER');

// Mode indicators (4-bit)
export const QRMode = {
  MODE_NUMBER: 1, // 0001
  MODE_ALPHA_NUM: 1 << 1, // 0010
  MODE_8BIT_BYTE: 1 << 2, // 0100
  MODE_KANJI: 1 << 3, // 1000
} as const;

export type QRModeType = (typeof QRMode)[keyof typeof QRMode];

// Error correction levels (internal numeric representation)
export const QRErrorCorrectionLevel = {
  L: 1, // ~7% recovery
  M: 0, // ~15% recovery
  Q: 3, // ~25% recovery
  H: 2, // ~30% recovery
} as const;

export type QRErrorCorrectionLevelType =
  (typeof QRErrorCorrectionLevel)[keyof typeof QRErrorCorrectionLevel];
export type QRErrorCorrectionLevelChar = 'L' | 'M' | 'Q' | 'H';

// Mask patterns (0-7)
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

// QR code instance interface
export interface QRCodeInstance {
  addData: (data: string, mode?: string) => void;
  isDark: (row: number, col: number) => boolean;
  getModuleCount: () => number;
  make: (maskPattern?: number) => void;
  createTableTag: (cellSize?: number, margin?: number) => string;
  createSvgTag: (cellSize?: number, margin?: number, alt?: unknown, title?: unknown) => string;
  createDataURL: (cellSize?: number, margin?: number) => string;
  createImgTag: (cellSize?: number, margin?: number, alt?: string) => string;
  createASCII: (cellSize?: number, margin?: number) => string;
  renderTo2dContext: (context: CanvasRenderingContext2D, cellSize?: number) => void;
  // Test/debug helper: access interleaved data bytes
  getDataCache?: () => number[];
}

// Data segment interface (for mode encoders)
export interface QRDataSegment {
  getMode: () => number;
  getLength: () => number;
  write: (buffer: QRBitBuffer) => void;
}

// Bit buffer interface
export interface QRBitBuffer {
  getBuffer: () => number[];
  getAt: (index: number) => boolean;
  put: (num: number, length: number) => void;
  getLengthInBits: () => number;
  putBit: (bit: boolean) => void;
}

// RS Block interface
export interface RSBlock {
  totalCount: number;
  dataCount: number;
}

// Polynomial interface
export interface QRPolynomial {
  getAt: (index: number) => number;
  getLength: () => number;
  multiply: (e: QRPolynomial) => QRPolynomial;
  mod: (e: QRPolynomial) => QRPolynomial;
}
