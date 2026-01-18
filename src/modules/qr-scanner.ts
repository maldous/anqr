/**
 * QR Scanner Module
 * Re-exports scanner functionality from qr-analyzer module
 */

export {
  scanCanvas,
  scanFile,
  scanImageData,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
  QRScanner,
  type QRLocation,
  type ScanResult,
  type ValidationResult,
} from './qr-analyzer';

export default {
  scanCanvas: (...args: Parameters<typeof import('./qr-analyzer').scanCanvas>) => 
    import('./qr-analyzer').then(m => m.scanCanvas(...args)),
};
