/**
 * QR Encoder Utilities
 * Provides QR encoding helper functions
 */

import { qrcode } from './encoder';
import type { QRErrorCorrectionLevelChar } from './types';

// Type aliases for QR encoding
export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
export type EncodingMode = 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji';
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

function toEncoderModeToken(mode: EncodingMode, content: string): string | undefined {
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
 * Create a QR code instance
 */
export function createQRInstance(
  data: string,
  errorCorrectionLevel: ECCLevel = 'M',
  version: number = 0,
  options: Pick<QROptions, 'mode' | 'maskPattern'> = {}
): QRInstance {
  const typeNumber = version === 0 ? 0 : version;
  const qr = qrcode(
    typeNumber,
    errorCorrectionLevel as QRErrorCorrectionLevelChar
  ) as unknown as QRInstance;

  const modeToken = options.mode ? toEncoderModeToken(options.mode, data) : undefined;
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
 */
export function calculateOptimalVersion(
  data: string,
  errorCorrectionLevel: ECCLevel = 'M'
): number {
  // Try each version until one fits
  for (let v = 1; v <= 40; v++) {
    try {
      createQRInstance(data, errorCorrectionLevel, v, { mode: 'auto' });
      return v;
    } catch {
      // Version too small, try next
    }
  }
  return 40; // Max version
}
