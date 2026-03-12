/**
 * QR Specification Module - Public API Manifest
 *
 * This file documents all public exports from the qr-spec module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('SPEC');

// Version and size
export const VERSION_API = [
  'getModuleCountForVersion',
  'getVersionFromModuleCount',
  'getAlignmentPositions',
] as const;

// Pattern detection
export const PATTERN_API = [
  'isFinderPattern',
  'isTimingPattern',
  'isAlignmentPattern',
  'isStructuralModule',
  'isData',
  'isLocked',
  'getAlignmentPatternCenters',
  'isFormatInfo',
  'isVersionInfo',
] as const;

// Mask functions
export const MASK_API = ['getMaskFunction'] as const;

// BCH encoding
export const BCH_API = ['getBCHTypeInfo', 'getBCHTypeNumber'] as const;

// Constants
export const CONSTANTS = [
  'ALIGNMENT_POSITIONS',
  'ECC_CAPACITIES_NUMERIC',
  'ECC_CAPACITIES_ALPHANUMERIC',
  'ECC_CAPACITIES_BYTE',
  'ECC_LEVEL_MAP',
  'MODE_NUMERIC',
  'MODE_ALPHANUMERIC',
  'MODE_BYTE',
  'MODE_KANJI',
  'MODE_TERMINATOR',
  'QRErrorCorrectionLevel',
  'QRMaskPattern',
  'QRMode',
] as const;

// Types
export const TYPES = [
  'ECCLevel',
  'EncodingMode',
  'MaskPattern',
  'QRErrorCorrectionLevelType',
  'QRMaskPatternType',
  'QRModeType',
] as const;

// All public exports
export const PUBLIC_API = [
  ...VERSION_API,
  ...PATTERN_API,
  ...MASK_API,
  ...BCH_API,
  ...CONSTANTS,
] as const;
