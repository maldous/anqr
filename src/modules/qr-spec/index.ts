/**
 * QR Specification Module
 * QR code domain knowledge - constants, patterns, and encoding rules
 * 
 * This module provides:
 * - Alignment pattern positions (single source of truth)
 * - Pattern detection (finder, timing, alignment)
 * - Mask functions
 * - BCH encoding for format/version info
 * - Data capacity tables
 * 
 * Rules:
 * - Depends only on core/
 * - NO pixels, canvas, DOM, or ImageData
 * - Pure coordinate/number math only
 */

// Types
export type {
  ECCLevel,
  QRErrorCorrectionLevelType,
  QRModeType,
  QRMaskPatternType,
  MaskPattern,
  EncodingMode,
} from './types';

export {
  QRErrorCorrectionLevel,
  ECC_LEVEL_MAP,
  QRMode,
  QRMaskPattern,
  MODE_NUMERIC,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  MODE_TERMINATOR,
} from './types';

// Constants
export {
  ALIGNMENT_POSITIONS,
  getAlignmentPositions,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
  ECC_CAPACITIES_ALPHANUMERIC,
  getVersionFromModuleCount,
  getModuleCountForVersion,
} from './constants';

// Pattern detection
export {
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isLocked,
  isData,
  isStructuralModule,
  isFormatInfo,
  isVersionInfo,
  getAlignmentPatternCenters,
} from './patterns';

// Mask functions
export { getMaskFunction } from './masks';

// BCH encoding
export { getBCHTypeInfo, getBCHTypeNumber } from './bch';
