import { log } from './log';
import { loadFileAsCanvas } from './load-file-as-canvas';

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
