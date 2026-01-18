/**
 * QR Core Module
 * Provides QR code generation, encoding, and structural element detection
 */

import qrcode from './qr-encoder';

// ============================================
// TYPES
// ============================================

export type ECCLevel = 'L' | 'M' | 'Q' | 'H';
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
// ALIGNMENT PATTERN POSITIONS
// ============================================

const ALIGNMENT_POSITIONS: (number[] | null)[] = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

// ECC capacity (bytes) per version - for Byte mode
const ECC_CAPACITIES_BYTE: Record<ECCLevel, number[]> = {
  L: [
    17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
    929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431,
    2563, 2699, 2809, 2953,
  ],
  M: [
    14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
    711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989,
    2099, 2213, 2331,
  ],
  Q: [
    11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482,
    509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423,
    1499, 1579, 1663,
  ],
  H: [
    7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403,
    439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219,
    1273,
  ],
};

// ECC capacity (numeric digits) per version - for Numeric mode
const ECC_CAPACITIES_NUMERIC: Record<ECCLevel, number[]> = {
  L: [
    41, 77, 127, 187, 255, 322, 370, 461, 552, 652, 772, 883, 1022, 1101, 1250, 1408, 1548, 1725,
    1903, 2061, 2232, 2409, 2620, 2812, 3057, 3283, 3517, 3669, 3909, 4158, 4417, 4686, 4965, 5253,
    5529, 5836, 6153, 6479, 6743, 7089,
  ],
  M: [
    34, 63, 101, 149, 202, 255, 293, 365, 432, 513, 604, 691, 796, 871, 991, 1082, 1212, 1346, 1500,
    1600, 1708, 1872, 2059, 2188, 2395, 2544, 2701, 2857, 3035, 3289, 3486, 3693, 3909, 4134, 4343,
    4588, 4775, 5039, 5313, 5596,
  ],
  Q: [
    27, 48, 77, 111, 144, 178, 207, 259, 312, 364, 427, 489, 580, 621, 703, 775, 876, 948, 1063,
    1159, 1224, 1358, 1468, 1588, 1718, 1804, 1933, 2085, 2181, 2358, 2473, 2670, 2805, 2949, 3081,
    3244, 3417, 3599, 3791, 3993,
  ],
  H: [
    17, 34, 58, 82, 106, 139, 154, 202, 235, 288, 331, 374, 427, 468, 530, 602, 674, 746, 813, 919,
    969, 1056, 1108, 1228, 1286, 1425, 1501, 1581, 1677, 1782, 1897, 2022, 2157, 2301, 2361, 2524,
    2625, 2735, 2927, 3057,
  ],
};

// ECC capacity (alphanumeric characters) per version - for Alphanumeric mode
const ECC_CAPACITIES_ALPHANUMERIC: Record<ECCLevel, number[]> = {
  L: [
    25, 47, 77, 114, 154, 195, 224, 279, 335, 395, 468, 535, 619, 667, 758, 854, 938, 1046, 1153,
    1249, 1352, 1460, 1588, 1704, 1853, 1990, 2132, 2223, 2369, 2520, 2677, 2840, 3009, 3183, 3351,
    3537, 3729, 3927, 4087, 4296,
  ],
  M: [
    20, 38, 61, 90, 122, 154, 178, 221, 262, 311, 366, 419, 483, 528, 600, 656, 734, 816, 909, 970,
    1035, 1134, 1248, 1326, 1451, 1542, 1637, 1732, 1839, 1994, 2113, 2238, 2369, 2506, 2632, 2780,
    2894, 3054, 3220, 3391,
  ],
  Q: [
    16, 29, 47, 67, 87, 108, 125, 157, 189, 221, 259, 296, 352, 376, 426, 470, 531, 574, 644, 702,
    742, 823, 890, 963, 1041, 1094, 1172, 1263, 1322, 1429, 1499, 1618, 1700, 1787, 1867, 1966,
    2071, 2181, 2298, 2420,
  ],
  H: [
    10, 20, 35, 50, 64, 84, 93, 122, 143, 174, 200, 227, 259, 283, 321, 365, 408, 452, 493, 557,
    587, 640, 672, 744, 779, 864, 910, 958, 1016, 1080, 1150, 1226, 1307, 1394, 1431, 1530, 1591,
    1658, 1774, 1852,
  ],
};

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
 */
export function getVersionFromModuleCount(moduleCount: number): number {
  return (moduleCount - 17) / 4;
}

/**
 * Get module count for a QR version
 */
export function getModuleCountForVersion(version: number): number {
  return version * 4 + 17;
}

// ============================================
// STRUCTURAL ELEMENT DETECTION
// ============================================

/**
 * Get alignment pattern positions for a QR version (raw coordinate array)
 */
export function getAlignmentPositions(version: number): number[] {
  if (version < 2 || version > 40) return [];
  return ALIGNMENT_POSITIONS[version] || [];
}

/**
 * Get alignment pattern center positions as {row, col} objects
 * Excludes positions that overlap with finder patterns
 */
export function getAlignmentPatternCenters(
  version: number,
  moduleCount: number
): Array<{ row: number; col: number }> {
  if (version < 2) return [];

  const coords = getAlignmentPositions(version);
  const positions: Array<{ row: number; col: number }> = [];

  for (const r of coords) {
    for (const c of coords) {
      // Skip positions that overlap with finder patterns
      if (r < 8 && c < 8) continue;
      if (r < 8 && c > moduleCount - 9) continue;
      if (r > moduleCount - 9 && c < 8) continue;
      positions.push({ row: r, col: c });
    }
  }

  return positions;
}

/**
 * Check if a position is a finder pattern (7x7 corner patterns)
 */
export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  // Top-left
  if (row < 7 && col < 7) return true;
  // Top-right
  if (row < 7 && col >= moduleCount - 7) return true;
  // Bottom-left
  if (row >= moduleCount - 7 && col < 7) return true;
  return false;
}

/**
 * Check if a position is a timing pattern (row/col 6)
 * Optionally checks bounds to exclude areas that overlap with finder patterns
 */
export function isTimingPattern(row: number, col: number, moduleCount?: number): boolean {
  // Simple check if no moduleCount provided (backwards compatibility)
  if (moduleCount === undefined) {
    return row === 6 || col === 6;
  }
  // Horizontal timing pattern (row 6, between finders)
  if (row === 6 && col >= 8 && col < moduleCount - 8) return true;
  // Vertical timing pattern (col 6, between finders)
  if (col === 6 && row >= 8 && row < moduleCount - 8) return true;
  return false;
}

/**
 * Check if a position is an alignment pattern
 */
export function isAlignmentPattern(row: number, col: number, moduleCount: number): boolean {
  const version = getVersionFromModuleCount(moduleCount);
  const positions = getAlignmentPositions(version);

  if (positions.length === 0) return false;

  for (const px of positions) {
    for (const py of positions) {
      // Skip alignment patterns that overlap with finder patterns
      if (px < 8 && py < 8) continue;
      if (px < 8 && py > moduleCount - 9) continue;
      if (px > moduleCount - 9 && py < 8) continue;

      if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a position is a locked structural element
 * (finder patterns, timing, alignment - cannot be modified)
 */
export function isLocked(moduleCount: number, x: number, y: number, scale: number = 1): boolean {
  const l = moduleCount / scale;
  const sx = Math.floor(x / scale);
  const sy = Math.floor(y / scale);

  // Out of bounds
  if (sx < 0 || sy < 0 || sx >= l || sy >= l) return true;

  // Finder patterns (top-left, top-right, bottom-left)
  if (sx < 7 && sy < 7) return true;
  if (sx < 7 && sy > l - 8) return true;
  if (sx > l - 8 && sy < 7) return true;

  // Timing patterns
  if (sx === 6 || sy === 6) return true;

  // Alignment patterns
  const version = getVersionFromModuleCount(l);
  const positions = getAlignmentPositions(version);

  if (positions.length > 0) {
    for (const px of positions) {
      for (const py of positions) {
        // Skip alignment patterns that overlap with finder patterns
        if (px < 8 && py < 8) continue;
        if (px < 8 && py > l - 9) continue;
        if (px > l - 9 && py < 8) continue;

        if (Math.abs(sx - px) <= 2 && Math.abs(sy - py) <= 2) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if a position is a data point (center of scaled module)
 * Data points must preserve QR values for scannability
 */
export function isData(x: number, y: number, scale: number): boolean {
  const m = Math.floor(scale / 2);
  const xs = x % scale;
  const ys = y % scale;

  if (xs === m && ys === m) return true;
  if (scale % 2 === 1) return false;

  // For even scales, data occupies 2x2 center
  if (xs === m && ys === m - 1) return true;
  if (xs === m - 1 && ys === m) return true;
  if (xs === m - 1 && ys === m - 1) return true;

  return false;
}

/**
 * Check if a module is a structural element that cannot be modified
 * More comprehensive than isLocked - includes format/version info
 */
export function isStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  // Finder patterns + separators
  if (row < 8 && col < 8) return true;
  if (row < 8 && col >= moduleCount - 8) return true;
  if (row >= moduleCount - 8 && col < 8) return true;

  // Timing patterns
  if (row === 6 || col === 6) return true;

  // Format information
  if (row === 8 && col < 9) return true;
  if (col === 8 && row < 9) return true;
  if (row === 8 && col >= moduleCount - 8) return true;
  if (col === 8 && row >= moduleCount - 8) return true;

  // Dark module
  if (row === moduleCount - 8 && col === 8) return true;

  // Version info (version 7+)
  if (version >= 7) {
    if (row >= moduleCount - 11 && row < moduleCount - 8 && col < 6) return true;
    if (col >= moduleCount - 11 && col < moduleCount - 8 && row < 6) return true;
  }

  // Alignment patterns (version 2+)
  if (version >= 2) {
    const positions = getAlignmentPositions(version);
    for (const px of positions) {
      for (const py of positions) {
        if (px < 8 && py < 8) continue;
        if (px < 8 && py > moduleCount - 9) continue;
        if (px > moduleCount - 9 && py < 8) continue;
        if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) return true;
      }
    }
  }

  return false;
}

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
