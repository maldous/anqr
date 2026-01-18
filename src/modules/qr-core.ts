/**
 * QR Core Module
 * Provides QR code generation, encoding, and structural element detection
 * 
 * This module re-exports from qr-spec for backward compatibility
 * and adds generation functions that use qr-encoder.
 */

import qrcode from './qr-encoder';

// Import from canonical source (qr-spec)
import {
  ALIGNMENT_POSITIONS as ALIGNMENT_POSITIONS_FROM_SPEC,
  getAlignmentPositions as getAlignmentPositionsFromSpec,
  ECC_CAPACITIES_BYTE as ECC_CAPACITIES_BYTE_FROM_SPEC,
  ECC_CAPACITIES_NUMERIC as ECC_CAPACITIES_NUMERIC_FROM_SPEC,
  ECC_CAPACITIES_ALPHANUMERIC as ECC_CAPACITIES_ALPHANUMERIC_FROM_SPEC,
  getVersionFromModuleCount as getVersionFromModuleCountFromSpec,
  getModuleCountForVersion as getModuleCountForVersionFromSpec,
  isFinderPattern as isFinderPatternFromSpec,
  isTimingPattern as isTimingPatternFromSpec,
  isAlignmentPattern as isAlignmentPatternFromSpec,
  isLocked as isLockedFromSpec,
  isData as isDataFromSpec,
  isStructuralModule as isStructuralModuleFromSpec,
  getAlignmentPatternCenters as getAlignmentPatternCentersFromSpec,
  type ECCLevel as ECCLevelType,
} from './qr-spec';

// ============================================
// TYPES
// ============================================

export type ECCLevel = ECCLevelType;
export type MaskPattern = 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type EncodingMode = 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji';

export interface QROptions {
  text: string;
  ecc: ECCLevel;
  version?: number; // 0 = auto, 1-40
  mask?: MaskPattern;
  scale?: number; // subpixel scale (e.g., 3 for 3x3 per module)
}

export interface QRMatrix {
  matrix: boolean[][];
  moduleCount: number;
  version: number;
}

export interface QRInstance {
  isDark: (row: number, col: number) => boolean;
  getModuleCount: () => number;
}

// ============================================
// RE-EXPORT CONSTANTS FROM QR-SPEC
// ============================================

// Re-export with backward-compatible format (1-indexed with null at index 0)
// qr-spec uses 0-indexed (version 1 at index 0), qr-core historically uses 1-indexed
const ALIGNMENT_POSITIONS: (number[] | null)[] = [
  null, // Index 0 (no version 0)
  ...ALIGNMENT_POSITIONS_FROM_SPEC, // Versions 1-40
];

// Re-export ECC capacity tables from qr-spec
const ECC_CAPACITIES_BYTE = ECC_CAPACITIES_BYTE_FROM_SPEC;
const ECC_CAPACITIES_NUMERIC = ECC_CAPACITIES_NUMERIC_FROM_SPEC;
const ECC_CAPACITIES_ALPHANUMERIC = ECC_CAPACITIES_ALPHANUMERIC_FROM_SPEC;

// Legacy alias for backward compatibility
const ECC_CAPACITIES = ECC_CAPACITIES_BYTE;

// ============================================
// VERSION CALCULATION
// ============================================

/**
 * Calculate optimal QR version for given content, ECC level, and encoding mode
 * @param content - The content to encode
 * @param ecc - Error correction level
 * @param mode - Encoding mode (defaults to 'byte' for backward compatibility)
 */
export function calculateOptimalVersion(
  content: string,
  ecc: ECCLevel,
  mode: 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji' = 'byte'
): number {
  // Determine effective mode for 'auto'
  let effectiveMode = mode;
  if (mode === 'auto') {
    effectiveMode = detectOptimalMode(content);
  }

  // Select appropriate capacity table based on mode
  let caps: number[];
  let len: number;

  switch (effectiveMode) {
    case 'numeric':
      caps = ECC_CAPACITIES_NUMERIC[ecc];
      len = content.length;
      break;
    case 'alphanumeric':
      caps = ECC_CAPACITIES_ALPHANUMERIC[ecc];
      len = content.length;
      break;
    case 'kanji':
      // Kanji mode: each Shift-JIS character is 13 bits, roughly 2 bytes per char
      // Use byte capacity as approximation (conservative)
      caps = ECC_CAPACITIES_BYTE[ecc];
      len = content.length * 2;
      break;
    default:
      // IMPORTANT: For byte mode, we must count UTF-8 bytes, not characters!
      // A single character can be 1-4 bytes in UTF-8 encoding.
      // The QR library encodes strings as UTF-8 bytes.
      caps = ECC_CAPACITIES_BYTE[ecc];
      len = getUtf8ByteLength(content);
      break;
  }

  for (let v = 0; v < caps.length; v++) {
    if (caps[v] >= len) {
      return v + 1;
    }
  }

  return 40;
}

/**
 * Calculate UTF-8 byte length of a string
 * This is critical for QR version calculation since QR encodes strings as UTF-8 bytes
 */
function getUtf8ByteLength(str: string): number {
  // Use TextEncoder for accurate UTF-8 byte counting
  // This handles all Unicode characters correctly (including emoji, CJK, etc.)
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  // Fallback for environments without TextEncoder (shouldn't happen in modern browsers)
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code < 0xdc00) {
      // Surrogate pair (4 bytes for the full character)
      bytes += 4;
      i++; // Skip the low surrogate
    } else bytes += 3;
  }
  return bytes;
}

/**
 * Check if content is valid for a specific encoding mode
 * Returns true if the content can be encoded with the given mode
 */
export function isValidForMode(
  content: string,
  mode: 'numeric' | 'alphanumeric' | 'byte' | 'kanji'
): boolean {
  switch (mode) {
    case 'numeric':
      return /^[0-9]*$/.test(content);
    case 'alphanumeric':
      return /^[0-9A-Z $%*+\-./:]*$/.test(content);
    case 'byte':
      return true; // Byte mode can encode anything
    case 'kanji':
      // Kanji mode requires Shift-JIS compatible characters
      // For simplicity, we allow it to try (library will validate)
      return true;
    default:
      return true;
  }
}

/**
 * Get a compatible encoding mode for the given content
 * If the requested mode can't encode the content, returns a fallback mode
 */
export function getCompatibleMode(
  content: string,
  requestedMode: 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji'
): 'numeric' | 'alphanumeric' | 'byte' | 'kanji' {
  if (requestedMode === 'auto') {
    return detectOptimalMode(content);
  }

  // Check if requested mode is compatible
  if (isValidForMode(content, requestedMode)) {
    return requestedMode;
  }

  // Fall back to a compatible mode
  // Try alphanumeric first (if content matches), otherwise byte
  if (requestedMode === 'numeric') {
    if (isValidForMode(content, 'alphanumeric')) {
      return 'alphanumeric';
    }
    return 'byte';
  }

  if (requestedMode === 'alphanumeric') {
    return 'byte';
  }

  // Kanji fallback to byte
  if (requestedMode === 'kanji') {
    return 'byte';
  }

  return 'byte';
}

/**
 * Detect the optimal encoding mode for the given content
 * Exported for use in qr-generator.js to ensure consistent mode detection
 */
export function detectOptimalMode(content: string): 'numeric' | 'alphanumeric' | 'byte' {
  // Check if all characters are numeric (0-9)
  if (/^[0-9]*$/.test(content)) {
    return 'numeric';
  }

  // Check if all characters are alphanumeric (0-9, A-Z, space, $%*+-./:)
  if (/^[0-9A-Z $%*+\-./:]*$/.test(content)) {
    return 'alphanumeric';
  }

  // Default to byte mode
  return 'byte';
}

/**
 * Get QR version from module count
 * Re-exported from qr-spec for backward compatibility
 */
export const getVersionFromModuleCount = getVersionFromModuleCountFromSpec;

/**
 * Get module count for a QR version
 * Re-exported from qr-spec for backward compatibility
 */
export const getModuleCountForVersion = getModuleCountForVersionFromSpec;

// ============================================
// STRUCTURAL ELEMENT DETECTION
// ============================================

/**
 * Get alignment pattern positions for a QR version (raw coordinate array)
 * Re-exported from qr-spec for backward compatibility
 */
export const getAlignmentPositions = getAlignmentPositionsFromSpec;

/**
 * Get alignment pattern center positions as {row, col} objects
 * Excludes positions that overlap with finder patterns
 * Re-exported from qr-spec for backward compatibility
 */
export const getAlignmentPatternCenters = getAlignmentPatternCentersFromSpec;

/**
 * Check if a position is a finder pattern (7x7 corner patterns)
 * Re-exported from qr-spec for backward compatibility
 */
export const isFinderPattern = isFinderPatternFromSpec;

/**
 * Check if a position is a timing pattern (row/col 6)
 * Re-exported from qr-spec for backward compatibility
 */
export const isTimingPattern = isTimingPatternFromSpec;

/**
 * Check if a position is an alignment pattern
 * Re-exported from qr-spec for backward compatibility
 */
export const isAlignmentPattern = isAlignmentPatternFromSpec;

/**
 * Check if a position is a locked structural element
 * (finder patterns, timing, alignment - cannot be modified)
 * Re-exported from qr-spec for backward compatibility
 */
export const isLocked = isLockedFromSpec;

/**
 * Check if a position is a data point (center of scaled module)
 * Data points must preserve QR values for scannability
 * Re-exported from qr-spec for backward compatibility
 */
export const isData = isDataFromSpec;

/**
 * Check if a module is a structural element that cannot be modified
 * More comprehensive than isLocked - includes format/version info
 * Re-exported from qr-spec for backward compatibility
 */
export const isStructuralModule = isStructuralModuleFromSpec;

// ============================================
// QR GENERATION
// ============================================

/**
 * Generate a QR code matrix
 */
export function generateQR(options: QROptions): QRMatrix {
  const { text, ecc, version = 0, scale = 1 } = options;

  // Auto-detect version if not specified
  let typeNumber = version;
  if (typeNumber === 0) {
    typeNumber = calculateOptimalVersion(text, ecc);
  }

  // Generate QR using vendor library
  const qr = qrcode(typeNumber, ecc);
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const scaledSize = moduleCount * scale;

  // Create matrix
  const matrix: boolean[][] = [];
  for (let y = 0; y < scaledSize; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < scaledSize; x++) {
      const qrX = Math.floor(x / scale);
      const qrY = Math.floor(y / scale);
      row.push(qr.isDark(qrY, qrX));
    }
    matrix.push(row);
  }

  return {
    matrix,
    moduleCount: scaledSize,
    version: typeNumber,
  };
}

/**
 * Generate a raw QR instance for direct access
 */
export function createQRInstance(text: string, ecc: ECCLevel, version: number = 0): QRInstance {
  let typeNumber = version;
  if (typeNumber === 0) {
    typeNumber = calculateOptimalVersion(text, ecc);
  }

  const qr = qrcode(typeNumber, ecc);
  qr.addData(text);
  qr.make();

  return qr;
}

// ============================================
// EXPORT
// ============================================

export const QRCore = {
  // Generation
  generateQR,
  createQRInstance,

  // Version
  calculateOptimalVersion,
  getVersionFromModuleCount,
  getModuleCountForVersion,

  // Mode detection & validation
  detectOptimalMode,
  isValidForMode,
  getCompatibleMode,

  // Structural detection
  getAlignmentPositions,
  getAlignmentPatternCenters,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isLocked,
  isData,
  isStructuralModule,

  // Constants
  ALIGNMENT_POSITIONS,
  ECC_CAPACITIES,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
  ECC_CAPACITIES_ALPHANUMERIC,
};

export default QRCore;
