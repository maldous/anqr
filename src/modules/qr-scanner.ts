/**
 * QR Scanner/Validator Module
 * @deprecated Import from './qr-analyzer' instead
 *
 * Uses jsQR to decode and validate generated QR codes
 */

export {
  scanCanvas,
  scanImageData,
  scanFile,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
  QRScanner,
  type ScanResult,
  type QRLocation,
  type ValidationResult,
} from './qr-analyzer/internal/scanner';

export default QRScanner;
