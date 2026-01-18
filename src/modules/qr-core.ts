/**
 * QR Core Module
 * Re-exports QR code generation utilities from qr-encoder
 */

import {
  generateQR,
  createQRInstance,
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
  QRCore,
  type ECCLevel,
  type EncodingMode,
  type MaskPattern,
  type QROptions,
  type QRMatrix,
  type QRInstance,
} from './qr-encoder/';

// Re-export types
export type { ECCLevel, EncodingMode, MaskPattern, QROptions, QRMatrix, QRInstance };

// Re-export functions and namespace
export {
  generateQR,
  createQRInstance,
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
  QRCore,
};

export default QRCore;
