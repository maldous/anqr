// Barrel: domain/qr/encode
export { qrcode } from "./encoder";
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
} from "../qr-encoder/encoder-api";
export {
  createStringToBytes,
  getStringToBytes,
  resetStringToBytes,
  setStringToBytes,
  stringToBytes,
  stringToBytesFn,
} from "./string-bytes";
