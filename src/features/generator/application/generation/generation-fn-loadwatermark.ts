/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Load watermark image for animation frames.
 */

import { createLogger } from '@/infra/logging/logger';
import { loadFileAsCanvas } from '@/features/generator/application/input/input-fn-loadfilecanvas';

const log = createLogger('QR');

export async function loadWatermarkForAnimation(watermark: {
  enabled: boolean;
  kind: string;
  image: File | null;
}): Promise<HTMLImageElement | HTMLCanvasElement | null> {
  if (
    watermark.enabled &&
    (watermark.kind === 'image' || watermark.kind === 'pattern') &&
    watermark.image
  ) {
    try {
      return await loadFileAsCanvas(watermark.image);
    } catch (err) {
      log.error('Error loading watermark', { error: err });
    }
  }
  return null;
}
