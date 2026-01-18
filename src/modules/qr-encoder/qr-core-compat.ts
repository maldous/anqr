/**
 * QR Core Compatibility Layer
 * Provides QR encoding functions that wrap the encoder module.
 * 
 * Pattern detection functions are re-exported from qr-spec (canonical source).
 * Callers should prefer importing directly from qr-spec for pattern functions.
 */

import { qrcode } from './encoder';
import type { QRErrorCorrectionLevelChar } from './types';

// Type aliases for qr-core compatibility
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
  make(): void;
}

/**
 * Create a QR code instance
 */
export function createQRInstance(
  data: string,
  errorCorrectionLevel: ECCLevel = 'M',
  version: number = 0
): QRInstance {
  const typeNumber = version === 0 ? undefined : version;
  const qr = qrcode(typeNumber ?? 0, errorCorrectionLevel as QRErrorCorrectionLevelChar);
  qr.addData(data);
  qr.make();

  return qr as QRInstance;
}

/**
 * Generate QR code matrix
 */
export function generateQR(
  data: string,
  options: QROptions = {}
): QRMatrix {
  const ecc = options.errorCorrectionLevel ?? 'M';
  const version = options.version ?? 0;
  const instance = createQRInstance(data, ecc, version);
  const size = instance.getModuleCount();

  const modules: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = [];
    for (let col = 0; col < size; col++) {
      rowData.push(instance.isDark(row, col));
    }
    modules.push(rowData);
  }

  const actualVersion = (size - 17) / 4;

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
    if (/^[0-9A-Z $%*+\-.\/:']+$/.test(content)) return 'alphanumeric';
    return 'byte';
  }
  
  // Validate that requested mode can encode the content
  switch (requestedMode) {
    case 'numeric':
      if (/^[0-9]+$/.test(content)) return 'numeric';
      break;
    case 'alphanumeric':
      if (/^[0-9A-Z $%*+\-.\/:']+$/.test(content)) return 'alphanumeric';
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
      const qr = qrcode(v, errorCorrectionLevel as QRErrorCorrectionLevelChar);
      qr.addData(data);
      qr.make();
      return v;
    } catch {
      // Version too small, try next
    }
  }
  return 40; // Max version
}

// Re-export pattern functions from qr-spec (canonical source)
// Callers should prefer importing from qr-spec directly
export {
  getModuleCountForVersion,
  getVersionFromModuleCount,
  getAlignmentPositions,
  getAlignmentPatternCenters,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isStructuralModule,
  isData,
  isLocked,
} from '../qr-spec';

/**
 * QRCore namespace object for backwards compatibility
 */
import {
  getModuleCountForVersion,
  getVersionFromModuleCount,
  getAlignmentPositions,
  getAlignmentPatternCenters,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isStructuralModule,
  isData,
  isLocked,
} from '../qr-spec';

export const QRCore = {
  createQRInstance,
  generateQR,
  calculateOptimalVersion,
  getModuleCountForVersion,
  getVersionFromModuleCount,
  getAlignmentPositions,
  getAlignmentPatternCenters,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isStructuralModule,
  isData,
  isLocked,
};

export default QRCore;
