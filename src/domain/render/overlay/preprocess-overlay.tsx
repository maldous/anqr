import { preprocessImageData } from '../filters/filters-preprocess';
import type { CreateCanvasFn, QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { hasPreprocessingOptions } from './has-preprocessing-options';
import { log } from './log';

/**
 * Preprocess overlay with filters
 */
export async function preprocessOverlay(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  const debug = config.debugOverlayDither === true;

  if (!hasPreprocessingOptions(config)) {
    if (debug) {
      log.debug('preprocessOverlay - no preprocessing needed, returning original canvas');
    }
    return canvas;
  }

  if (debug) {
    log.debug('preprocessOverlay - starting preprocessing', {
      canvasSize: { width: canvas.width, height: canvas.height },
      colorMode: config.colorMode,
      filterGrayscale: config.filterGrayscale,
      filterBrightness: config.filterBrightness,
      filterContrast: config.filterContrast,
    });
  }

  // Get image data
  const ctx = (
    canvas as unknown as {
      getContext(
        contextId: '2d',
        options?: CanvasRenderingContext2DSettings
      ): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    }
  ).getContext('2d', {
    willReadFrequently: true,
  });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Apply filters - pass debug flag through
  const processed = preprocessImageData(imageData, config, debug);

  // Create output canvas
  const result = await createCanvasFn(canvas.width, canvas.height);
  const resultCtx = result.getContext('2d') as CanvasRenderingContext2D | null;
  if (!resultCtx) return canvas;

  resultCtx.putImageData(processed, 0, 0);

  if (debug) {
    log.debug('preprocessOverlay - complete', {
      resultSize: { width: result.width, height: result.height },
    });
  }

  return result;
}
