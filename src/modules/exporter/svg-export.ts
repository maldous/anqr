/**
 * Exporter Module - SVG Export
 * Handles SVG export with embedded raster image
 */

import { Capacitor } from '@capacitor/core';
import { createLogger } from '../../lib/logger';
import type { ExportConfig, ExportResult } from './types';
import { downloadUrl, escapeXml } from './utils';

const _log = createLogger('EXPORT');

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
    gifDisposal: config.gifDisposal ?? 'restore_bg',
    metadata: config.metadata,
  };

  const dataUrl = canvas.toDataURL('image/png');

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
