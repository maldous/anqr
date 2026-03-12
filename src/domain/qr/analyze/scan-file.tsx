import type { ScanResult } from './scanner.types';
import { scanCanvas } from './scan-canvas';

/**
 * Scan a file for QR code
 */
export async function scanFile(file: File): Promise<ScanResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(scanCanvas(canvas));
        } else {
          resolve({ data: null, location: null });
        }
      };
      img.onerror = () => resolve({ data: null, location: null });
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve({ data: null, location: null });
    reader.readAsDataURL(file);
  });
}
