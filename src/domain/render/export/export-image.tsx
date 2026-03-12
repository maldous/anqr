import { embedPngDpi, embedPngMetadata } from './png-metadata';
import type { ExportConfig, ExportResult, PngMetadata } from '../../../modules/exporter/types';
import { log } from './log';

/**
 * Export canvas as PNG or WebP image
 */
export async function exportImage(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {},
  pngMetadata?: PngMetadata,
  dpi?: number
): Promise<ExportResult> {
  const opts: ExportConfig = {
    outputFormat: config.outputFormat ?? 'png',
    outputWidth: config.outputWidth ?? canvas.width,
    outputHeight: config.outputHeight ?? canvas.height,
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

  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  const format = mimeTypes[opts.outputFormat] ?? 'image/png';

  const quality = opts.outputQuality;

  // Scale canvas to output dimensions
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = opts.outputWidth;
  outputCanvas.height = opts.outputHeight;
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Apply background override if specified
  if (opts.bgOverride?.trim()) {
    ctx.fillStyle = opts.bgOverride;
    ctx.fillRect(0, 0, opts.outputWidth, opts.outputHeight);
  }

  // Use high quality scaling
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, opts.outputWidth, opts.outputHeight);

  let blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
      format,
      quality
    );
  });

  // Embed PNG metadata if provided
  if (pngMetadata && format === 'image/png') {
    try {
      blob = await embedPngMetadata(blob, pngMetadata);
    } catch (err) {
      log.warn('Failed to embed PNG metadata', { error: err });
    }
  }

  // Embed DPI if provided
  if (dpi && dpi > 0 && format === 'image/png') {
    try {
      blob = await embedPngDpi(blob, dpi);
    } catch (err) {
      log.warn('Failed to embed PNG DPI', { error: err });
    }
  }

  const extensionMap: Record<string, string> = {
    webp: 'webp',
    jpeg: 'jpg',
    png: 'png',
  };
  const ext = extensionMap[opts.outputFormat] ?? 'png';

  const filename = `${opts.filename}.${ext}`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: opts.outputFormat,
    width: opts.outputWidth,
    height: opts.outputHeight,
  };
}
