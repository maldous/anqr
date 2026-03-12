import { createGifEncoder, indexGifPixels, quantizeGifPalette } from '../../../modules/animation/index';
import { withGifEncodeLock } from '../animation/gif-lock';
import type { ExportConfig, ExportResult } from '../../../modules/exporter/types';
import { log, sampleGlobalPalette, renderFrameToScaledCtx } from './gif-export._internal';

/**
 * Export animation frames as GIF
 * OPTIMIZED: Uses global palette strategy for consistent colors across frames
 */
export async function exportGif(
  frames: HTMLCanvasElement[],
  config: Partial<ExportConfig> = {},
  frameDelays?: number[], // Optional per-frame delays in ms
  frameDisposals?: number[] // Optional per-frame disposal codes (0-3)
): Promise<ExportResult> {
  const opts: ExportConfig = {
    outputFormat: 'gif',
    outputWidth: config.outputWidth ?? frames[0]?.width ?? 400,
    outputHeight: config.outputHeight ?? frames[0]?.height ?? 400,
    outputQuality: config.outputQuality ?? 0.9,
    filename: config.filename ?? 'anqr-qrcode',
    animationSpeed: config.animationSpeed ?? 100,
    loopAnimation: config.loopAnimation ?? true,
    transparentBackground: config.transparentBackground ?? false,
    dpi: config.dpi ?? 72,
    includeMetadata: config.includeMetadata ?? false,
    includeQuietZone: config.includeQuietZone ?? true,
    bgOverride: config.bgOverride ?? '',
    gifDisposal: config.gifDisposal ?? 'keep',
    metadata: config.metadata,
  };

  const width = opts.outputWidth;
  const height = opts.outputHeight;
  const defaultDelay = opts.animationSpeed;
  const repeat = opts.loopAnimation ? 0 : -1; // 0 = loop forever, -1 = no loop

  // Get palette size from config (default 256, clamped to valid range 2-256)
  const paletteSize = Math.max(
    2,
    Math.min(256, (config as { gifPaletteSize?: number }).gifPaletteSize ?? 256)
  );

  // OPTIMIZATION: Reuse a single scaling canvas for all frames.
  // Prefer OffscreenCanvas where available to reduce main-thread canvas overhead.
  const scaledCanvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas === 'undefined'
      ? (() => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          return canvas;
        })()
      : new OffscreenCanvas(width, height);
  const scaledCtx =
    (scaledCanvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null) ??
    (scaledCanvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null);
  if (!scaledCtx) throw new Error('Could not get canvas context');

  // Pre-compute disposal code once (not per-frame)
  const disposalMap: Record<string, number> = {
    none: 0,
    keep: 1,
    restore_bg: 2,
    restore_previous: 3,
  };
  const disposal = disposalMap[opts.gifDisposal] ?? 2;

  // Check if we need to apply background
  const hasBgOverride = opts.bgOverride?.trim();

  log.debug('exportGif: start', {
    frameCount: frames.length,
    width,
    height,
    defaultDelayMs: defaultDelay,
    disposal: opts.gifDisposal,
    hasPerFrameDelays: !!frameDelays,
    perFrameDelayCount: frameDelays?.length,
    hasPerFrameDisposals: !!frameDisposals,
    paletteSize,
    loop: opts.loopAnimation,
  });

  const bytes = await withGifEncodeLock(() => {
    const gif = createGifEncoder();

    const globalPalette = sampleGlobalPalette(
      frames,
      scaledCtx,
      width,
      height,
      hasBgOverride,
      opts.bgOverride,
      paletteSize
    );

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const frameDelay = frameDelays?.[i] ? frameDelays[i] : defaultDelay;

      renderFrameToScaledCtx(scaledCtx, frame, width, height, hasBgOverride, opts.bgOverride);

      const imageData = scaledCtx.getImageData(0, 0, width, height);
      const palette = globalPalette || quantizeGifPalette(imageData.data, paletteSize);
      const safeIndex = indexGifPixels(imageData.data, palette).slice();
      const delayMs = Math.max(20, frameDelay);
      const frameDisposal = frameDisposals?.[i] ?? disposal;

      if (i === 0 || i === frames.length - 1) {
        log.debug('exportGif: frame', {
          index: i,
          delayMs,
          disposal: frameDisposal,
          source: frameDelays?.[i] ? 'perFrame' : 'default',
        });
      }

      gif.writeFrame(safeIndex, width, height, {
        palette,
        delay: delayMs,
        dispose: frameDisposal,
        ...(i === 0 && { repeat }),
      });
    }

    gif.finish();
    return gif.bytes();
  });

  const totalDelayMs = frames.reduce(
    (sum, _, i) => sum + (frameDelays?.[i] ? frameDelays[i] : defaultDelay),
    0
  );
  log.debug('exportGif: complete', {
    framesEncoded: frames.length,
    totalDurationMs: totalDelayMs,
    avgDelayMs: Math.round(totalDelayMs / frames.length),
    outputBytes: bytes.length,
  });
  const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
  const filename = `${opts.filename}.gif`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: 'gif',
    width,
    height,
  };
}
