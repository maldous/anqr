// Shim
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

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("SPEC");

// BCH encoding
export { getBCHTypeInfo, getBCHTypeNumber } from "../../domain/qr/spec/bch";
// Constants
export {
  ALIGNMENT_POSITIONS,
  ECC_CAPACITIES_ALPHANUMERIC,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
  getAlignmentPositions,
  getModuleCountForVersion,
  getVersionFromModuleCount,
} from "../../domain/qr/spec/constants";
// Mask functions
export { getMaskFunction } from "../../domain/qr/spec/masks";

// Pattern detection
export {
  getAlignmentPatternCenters,
  isAlignmentPattern,
  isData,
  isFinderPattern,
  isFormatInfo,
  isLocked,
  isStructuralModule,
  isTimingPattern,
  isVersionInfo,
} from "../../domain/qr/spec/qr-patterns";
// Types
export type {
  ECCLevel,
  EncodingMode,
  MaskPattern,
  QRErrorCorrectionLevelType,
  QRMaskPatternType,
  QRModeType,
} from "./types";
export {
  ECC_LEVEL_MAP,
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  MODE_NUMERIC,
  MODE_TERMINATOR,
  QRErrorCorrectionLevel,
  QRMaskPattern,
  QRMode,
} from "./types";
// Lightweight verification
export { verifyQRStructure } from "../../domain/qr/spec/verify";
