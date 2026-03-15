import type { AnimationFrame } from './types';
import { decodeBlobToCanvasViaBitmap } from './decode-blob-to-canvas-via-bitmap';

export async function parseBlobAsSingleFrame(
  blob: Blob,
  errorMessage: string
): Promise<AnimationFrame[]> {
  const bitmapCanvas = await decodeBlobToCanvasViaBitmap(blob);
  if (bitmapCanvas) {
    return [{ canvas: bitmapCanvas, delay: 100, disposalType: 0 }];
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
      resolve([{ canvas, delay: 100, disposalType: 0 }]);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(errorMessage));
    };

    img.src = url;
  });
}
