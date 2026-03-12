import { decodeQR } from '../../../modules/qr-decoder/index';
import type { ScanResult } from './scanner.types';

/**
 * Scan image data for QR code
 */
export function scanImageData(imageData: ImageData): ScanResult {
  try {
    const result = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });

    if (result?.success && result.data) {
      return {
        data: result.data,
        location: result.location ?? null,
      };
    }

    return { data: null, location: null };
  } catch {
    return { data: null, location: null };
  }
}
