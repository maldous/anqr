/**
 * QR Core Module
 * Re-exports QR code generation utilities from qr-encoder
 */

export {
  generateQR,
  createQRInstance,
  calculateOptimalVersion,
  getModuleCountForVersion,
  getVersionFromModuleCount,
  getAlignmentPositions,
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

export default QRCore;
