/**
 * QR Encoder Module
 * Our own QR code generator - zero external dependencies
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('ENCODER');

export { qrcode } from '../../domain/qr/encode/encoder';

// Pattern functions - re-exported from qr-spec (canonical source)
export {
  getAlignmentPatternCenters,
  getAlignmentPositions,
  getModuleCountForVersion,
  getVersionFromModuleCount,
  isAlignmentPattern,
  isData,
  isFinderPattern,
  isLocked,
  isStructuralModule,
  isTimingPattern,
} from '../qr-spec';
// Low-level APIs (for advanced use)
export { qrBitBuffer } from '../../domain/qr/encode/bit-buffer';
export { qr8BitByte, qrAlphaNum, qrKanji, qrNumber } from '../../domain/qr/encode/data-modes';
// QR encoder functions
export {
  calculateOptimalVersion,
  calculateSegmentBits,
  createQRInstance,
  createQRInstanceWithSegments,
  type DataSegment,
  type ECCLevel,
  type EncodingMode,
  generateQR,
  getCompatibleMode,
  type MaskPattern,
  optimizeSegments,
  type QRInstance,
  type QRMatrix,
  type QROptions,
} from './encoder-api';
export { gexp, glog, QRMath, qrPolynomial } from '../../domain/qr/encode/math';
export {
  base64EncodeOutputStream,
  byteArrayOutputStream,
  createDataURL,
  gifImage,
} from '../../domain/qr/encode/output';
export { getRSBlocks, QRRSBlock } from '../../domain/qr/encode/rs-blocks';
// Shift-JIS encoding
export { canEncodeAsShiftJIS, createShiftJISEncoder } from '../../domain/qr/encode/shift-jis';
// String encoding
export {
  createStringToBytes,
  getStringToBytes,
  resetStringToBytes,
  setStringToBytes,
  stringToBytes,
  stringToBytesFn,
} from '../../domain/qr/encode/string-bytes';
export type {
  QRBitBuffer,
  QRCodeInstance,
  QRDataSegment,
  QRErrorCorrectionLevelChar,
  QRErrorCorrectionLevelType,
  QRMaskPatternType,
  QRModeType,
  QRPolynomial,
  RSBlock,
} from './types';
// Types
export { QRErrorCorrectionLevel, QRMaskPattern, QRMode } from './types';
export {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
  getMaskFunction,
  getPatternPosition,
  QRUtil,
} from '../../domain/qr/encode/utils';
