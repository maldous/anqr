import type { QROptions, QRMatrix } from './encoder-api.types';
import { createQRInstance } from './create-qr-instance';

/**
 * Generate QR code matrix
 */
export function generateQR(data: string, options: QROptions = {}): QRMatrix {
  const ecc = options.errorCorrectionLevel ?? 'M';
  const version = options.version ?? 0;
  const instance = createQRInstance(data, ecc, version, {
    mode: options.mode,
    maskPattern: options.maskPattern,
  });
  const size = instance.getModuleCount();

  const modules: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = [];
    for (let col = 0; col < size; col++) {
      rowData.push(instance.isDark(row, col));
    }
    modules.push(rowData);
  }

  const actualVersion = Math.floor((size - 17) / 4);

  return {
    modules,
    size,
    version: actualVersion,
  };
}
