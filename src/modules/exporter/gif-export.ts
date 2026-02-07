/**
 * Exporter Module - GIF Export
 * Handles animated GIF export using gifenc
 */

import { Capacitor } from '@capacitor/core';
import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { createLogger } from '../../lib/logger';

const _log = createLogger('EXPORT');

import type { ExportConfig, ExportResult } from './types';
import { downloadUrl } from './utils';

/**
 * Export animation frames as GIF
 * OPTIMIZED: Uses global palette strategy for consistent colors across frames
 */
export async function exportGif(
  frames: HTMLCanvasElement[],
  config: Partial<ExportConfig> = {},
  frameDelays?: number[] // Optional per-frame delays in ms
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
    gifDisposal: config.gifDisposal ?? 'restore_bg',
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

  // Create GIF encoder
  const gif = GIFEncoder();

  // OPTIMIZATION: Reuse a single scaling canvas for all frames
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = width;
  scaledCanvas.height = height;
  const scaledCtx = scaledCanvas.getContext('2d');
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

  // GLOBAL PALETTE STRATEGY: Build palette from first frame (or sample multiple frames)
  let globalPalette: number[][] | null = null;

  if (frames.length > 0) {
    const framesToSample =
      frames.length > 10 ? [0, Math.floor(frames.length / 2), frames.length - 1] : [0];

    const pixelsPerFrame = width * height * 4; // RGBA
    const totalPixels = framesToSample.length * pixelsPerFrame;
    const sampledPixels = new Uint8ClampedArray(totalPixels);
    let offset = 0;

    for (const frameIdx of framesToSample) {
      const frame = frames[frameIdx];
      if (!frame) continue;

      scaledCtx.clearRect(0, 0, width, height);
      if (hasBgOverride) {
        scaledCtx.fillStyle = opts.bgOverride;
        scaledCtx.fillRect(0, 0, width, height);
      }
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(frame, 0, 0, width, height);

      const imageData = scaledCtx.getImageData(0, 0, width, height);
      sampledPixels.set(imageData.data, offset);
      offset += imageData.data.length;
    }

    globalPalette = quantize(sampledPixels, paletteSize);
  }

  // Encode each frame using the global palette
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const frameDelay = frameDelays?.[i] ? frameDelays[i] : defaultDelay;

    scaledCtx.clearRect(0, 0, width, height);

    if (hasBgOverride) {
      scaledCtx.fillStyle = opts.bgOverride;
      scaledCtx.fillRect(0, 0, width, height);
    }

    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(frame, 0, 0, width, height);

    const imageData = scaledCtx.getImageData(0, 0, width, height);
    const { data } = imageData;

    const palette = globalPalette || quantize(data, paletteSize);
    const index = applyPalette(data, palette);

    // Convert milliseconds to centiseconds (minimum 2 centiseconds)
    const delayCentiseconds = Math.max(2, Math.round(frameDelay / 10));

    gif.writeFrame(index, width, height, {
      palette,
      delay: delayCentiseconds,
      dispose: disposal,
      ...(i === 0 && { repeat }),
    });
  }

  gif.finish();

  const bytes = gif.bytes();
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

/**
 * Download animation as GIF
 */
export async function downloadGif(
  frames: HTMLCanvasElement[],
  config: Partial<ExportConfig> = {},
  frameDelays?: number[]
): Promise<void> {
  const result = await exportGif(frames, config, frameDelays);
  downloadUrl(result.url, result.filename, result.blob);
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
