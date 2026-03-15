import { scanCanvas } from './scan-canvas';
import { scanFile } from './scan-file';
import { scanImageData } from './scan-image-data';
import { validateQRCode } from './validate-qr-code';
import { validateQRCodeRobust } from './validate-qr-code-robust';
import { validateFrames } from './validate-frames';

/**
 * QRScanner class for backwards compatibility
 */
export const QRScanner = {
  scanCanvas,
  scanFile,
  scanImageData,
  validateQRCode,
  validateQRCodeRobust,
  validateFrames,
};
