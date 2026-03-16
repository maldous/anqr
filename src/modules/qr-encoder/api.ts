/**
 * QR Encoder Module - Public API Manifest
 *
 * This file documents all public exports from the qr-encoder module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("ENCODER");

// Main encoder
export const ENCODER_API = [
  "qrcode",
  "generateQR",
  "createQRInstance",
  "calculateOptimalVersion",
  "getCompatibleMode",
] as const;

// Pattern functions (re-exported from qr-spec)
export const PATTERN_API = [
  "getAlignmentPatternCenters",
  "getAlignmentPositions",
  "getModuleCountForVersion",
  "getVersionFromModuleCount",
  "isAlignmentPattern",
  "isData",
  "isFinderPattern",
  "isLocked",
  "isStructuralModule",
  "isTimingPattern",
] as const;

// Low-level APIs
export const LOW_LEVEL_API = [
  "qrBitBuffer",
  "qr8BitByte",
  "qrAlphaNum",
  "qrKanji",
  "qrNumber",
  "gexp",
  "glog",
  "QRMath",
  "qrPolynomial",
] as const;

// Output utilities
export const OUTPUT_API = [
  "base64EncodeOutputStream",
  "byteArrayOutputStream",
  "createDataURL",
  "gifImage",
] as const;

// RS Blocks
export const RS_API = ["getRSBlocks", "QRRSBlock"] as const;

// Shift-JIS
export const SHIFT_JIS_API = ["canEncodeAsShiftJIS", "createShiftJISEncoder"] as const;

// String encoding
export const STRING_API = [
  "createStringToBytes",
  "resetStringToBytes",
  "setStringToBytes",
  "stringToBytes",
  "stringToBytesFn",
] as const;

// Utilities
export const UTILS_API = [
  "getBCHTypeInfo",
  "getBCHTypeNumber",
  "getErrorCorrectPolynomial",
  "getLengthInBits",
  "getLostPoint",
  "getMaskFunction",
  "getPatternPosition",
  "QRUtil",
] as const;

// Constants/Enums
export const CONSTANTS = ["QRErrorCorrectionLevel", "QRMaskPattern", "QRMode"] as const;

// Types
export const TYPES = [
  "ECCLevel",
  "EncodingMode",
  "MaskPattern",
  "QRBitBuffer",
  "QRCodeInstance",
  "QRDataSegment",
  "QRErrorCorrectionLevelChar",
  "QRErrorCorrectionLevelType",
  "QRInstance",
  "QRMaskPatternType",
  "QRMatrix",
  "QRModeType",
  "QROptions",
  "QRPolynomial",
  "RSBlock",
] as const;

// All public exports
export const PUBLIC_API = [
  ...ENCODER_API,
  ...PATTERN_API,
  ...LOW_LEVEL_API,
  ...OUTPUT_API,
  ...RS_API,
  ...SHIFT_JIS_API,
  ...STRING_API,
  ...UTILS_API,
  ...CONSTANTS,
] as const;
