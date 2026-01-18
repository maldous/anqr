/**
 * QR Encoder Module
 * Our own QR code generator - zero external dependencies
 */

// Main encoder
import { qrcode } from './encoder';
export { qrcode };
export default qrcode;

// Types
export {
  QRMode,
  QRErrorCorrectionLevel,
  QRMaskPattern,
} from './types';
export type {
  QRModeType,
  QRErrorCorrectionLevelType,
  QRErrorCorrectionLevelChar,
  QRMaskPatternType,
  QRCodeInstance,
  QRDataSegment,
  QRBitBuffer,
  RSBlock,
  QRPolynomial,
} from './types';

// String encoding
export {
  stringToBytes,
  stringToBytesFn,
  setStringToBytes,
  resetStringToBytes,
  createStringToBytes,
} from './string-bytes';

// Low-level APIs (for advanced use)
export { qrBitBuffer } from './bit-buffer';
export { qrNumber, qrAlphaNum, qr8BitByte, qrKanji } from './data-modes';
export { QRMath, qrPolynomial, glog, gexp } from './math';
export { QRRSBlock, getRSBlocks } from './rs-blocks';
export {
  QRUtil,
  getBCHTypeInfo,
  getBCHTypeNumber,
  getPatternPosition,
  getMaskFunction,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
} from './utils';
export {
  byteArrayOutputStream,
  base64EncodeOutputStream,
  gifImage,
  createDataURL,
} from './output';

// Shift-JIS encoding
export { createShiftJISEncoder, canEncodeAsShiftJIS } from './internal/shift-jis';

// QR Core compatibility layer
export {
  createQRInstance,
  generateQR,
  calculateOptimalVersion,
  getCompatibleMode,
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
} from './qr-core-compat';
