import type { ExportConfig } from './export-config';

export function getDefaultExportConfig(): ExportConfig {
  return {
    outputFormat: 'png',
    outputWidth: 400,
    outputHeight: 400,
    outputQuality: 0.9,
    filename: 'anqr-qrcode',
    animationSpeed: 100,
    loopAnimation: true,
    transparentBackground: false,
    dpi: 72,
    includeMetadata: false,
    includeQuietZone: true,
    bgOverride: '',
    gifDisposal: 'keep',
  };
}
