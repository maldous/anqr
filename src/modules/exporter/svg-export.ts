/**
 * Exporter Module - SVG Export
 * Handles SVG export with embedded raster image
 */

import { Capacitor } from '@capacitor/core';
import { createLogger } from '../../lib/logger';
import type { ExportConfig, ExportResult } from './types';
import { downloadUrl, escapeXml } from './utils';

const _log = createLogger('EXPORT');

async function canvasToPngDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  if (typeof canvas.toBlob !== 'function') {
    return canvas.toDataURL('image/png');
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), 'image/png');
  });
  if (!blob) {
    return canvas.toDataURL('image/png');
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read PNG data URL'));
    };
    reader.onerror = () => reject(new Error('Failed to encode PNG data URL'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Export canvas as SVG (embedded raster)
 */
export async function exportSvg(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {}
): Promise<ExportResult> {
  const opts: ExportConfig = {
    outputFormat: 'svg',
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

  const dataUrl = await canvasToPngDataUrl(canvas);

  let metadata = '';
  if (opts.includeMetadata && opts.metadata) {
    const m = opts.metadata;
    if (m.title) metadata += `  <title>${escapeXml(m.title)}</title>\n`;
    if (m.description) metadata += `  <desc>${escapeXml(m.description)}</desc>\n`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${opts.outputWidth}" height="${opts.outputHeight}"
     viewBox="0 0 ${opts.outputWidth} ${opts.outputHeight}">
${metadata}  <image width="${opts.outputWidth}" height="${opts.outputHeight}" xlink:href="${dataUrl}"/>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const filename = `${opts.filename}.svg`;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename,
    format: 'svg',
    width: opts.outputWidth,
    height: opts.outputHeight,
  };
}

/**
 * Download canvas as SVG
 */
export async function downloadSvg(
  canvas: HTMLCanvasElement,
  config: Partial<ExportConfig> = {}
): Promise<void> {
  const result = await exportSvg(canvas, config);
  downloadUrl(result.url, result.filename, result.blob);
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
