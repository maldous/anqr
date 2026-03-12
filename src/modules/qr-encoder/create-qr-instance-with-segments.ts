import { qrcode } from '../../domain/qr/encode/encoder';
import type { QRErrorCorrectionLevelChar } from './types';
import type { DataSegment, ECCLevel, QROptions, QRInstance } from './encoder-api.types';
import { toEncoderModeToken } from './encoder-api._internal';

/**
 * Create a QR code instance with multiple data segments (mixed mode encoding)
 * This is essential for reproducing QArt codes efficiently
 */
export function createQRInstanceWithSegments(
  segments: DataSegment[],
  errorCorrectionLevel: ECCLevel = 'M',
  version: number = 0,
  options: Pick<QROptions, 'maskPattern'> = {}
): QRInstance {
  const typeNumber = version === 0 ? 0 : version;
  const qr = qrcode(
    typeNumber,
    errorCorrectionLevel as QRErrorCorrectionLevelChar
  ) as unknown as QRInstance;

  // Add each segment with its specific mode
  for (const segment of segments) {
    const modeToken = toEncoderModeToken(segment.mode, segment.data);
    qr.addData(segment.data, modeToken);
  }

  const mask = options.maskPattern;
  const maskPattern = typeof mask === 'number' && mask >= 0 && mask <= 7 ? mask : undefined;
  qr.make(maskPattern);

  return qr;
}
