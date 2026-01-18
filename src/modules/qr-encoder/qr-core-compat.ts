/**
 * QR Core Compatibility Layer
 * Provides wrapper functions and types for qr-core.ts
 */

import { qrcode } from './encoder';
import { QRErrorCorrectionLevel, type QRCodeInstance, type QRErrorCorrectionLevelChar } from './types';
import { getPatternPosition } from './utils';

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

/**
 * Get module count for a version
 */
export function getModuleCountForVersion(version: number): number {
  return 17 + version * 4;
}

/**
 * Get version from module count
 */
export function getVersionFromModuleCount(moduleCount: number): number {
  return (moduleCount - 17) / 4;
}

/**
 * Get alignment pattern positions for a version
 */
export function getAlignmentPositions(version: number): number[] {
  if (version < 2) return [];
  return getPatternPosition(version);
}

/**
 * Check if position is a finder pattern
 */
export function isFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left finder
  if (row >= size - 7 && col < 7) return true;
  return false;
}

/**
 * Check if position is a timing pattern
 */
export function isTimingPattern(row: number, col: number, size: number): boolean {
  // Horizontal timing (row 6)
  if (row === 6 && col >= 8 && col < size - 8) return true;
  // Vertical timing (col 6)
  if (col === 6 && row >= 8 && row < size - 8) return true;
  return false;
}

/**
 * Check if position is an alignment pattern
 */
export function isAlignmentPattern(
  row: number,
  col: number,
  version: number
): boolean {
  if (version < 2) return false;
  const positions = getAlignmentPositions(version);
  for (const r of positions) {
    for (const c of positions) {
      // Skip if overlaps with finder patterns
      if (r < 9 && c < 9) continue;
      if (r < 9 && c > getModuleCountForVersion(version) - 9) continue;
      if (r > getModuleCountForVersion(version) - 9 && c < 9) continue;

      // Check if within 5x5 alignment pattern centered at (r, c)
      if (Math.abs(row - r) <= 2 && Math.abs(col - c) <= 2) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if position is a structural module (finder, timing, alignment, format, version)
 */
export function isStructuralModule(
  row: number,
  col: number,
  version: number
): boolean {
  const size = getModuleCountForVersion(version);
  return (
    isFinderPattern(row, col, size) ||
    isTimingPattern(row, col, size) ||
    isAlignmentPattern(row, col, version)
  );
}

/**
 * Check if position is data (not structural)
 */
export function isData(row: number, col: number, version: number): boolean {
  return !isStructuralModule(row, col, version);
}

/**
 * Check if module is locked (structural or format info)
 */
export function isLocked(row: number, col: number, version: number): boolean {
  return isStructuralModule(row, col, version);
}

/**
 * Get alignment pattern centers for a version
 */
export function getAlignmentPatternCenters(version: number): Array<{row: number, col: number}> {
  if (version < 2) return [];
  const positions = getAlignmentPositions(version);
  const size = getModuleCountForVersion(version);
  const centers: Array<{row: number, col: number}> = [];
  
  for (const r of positions) {
    for (const c of positions) {
      // Skip if overlaps with finder patterns
      if (r < 9 && c < 9) continue;
      if (r < 9 && c > size - 9) continue;
      if (r > size - 9 && c < 9) continue;
      centers.push({ row: r, col: c });
    }
  }
  return centers;
}

/**
 * QRCore namespace object for backwards compatibility
 */
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
