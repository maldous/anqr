import type { StoreState } from './share-config-store-state.type';

export function buildShareOutput(output: StoreState['output']) {
  return {
    width: output.widthPx === 400 ? undefined : output.widthPx,
    height: output.heightPx === 400 ? undefined : output.heightPx,
    format: output.format === 'gif' ? undefined : output.format,
    quality: output.quality === 0.9 ? undefined : output.quality,
    filename: output.filename === 'anqr-qrcode' ? undefined : output.filename,
    dpi: output.dpi === 72 ? undefined : output.dpi,
    includeQuietZone: output.includeQuietZone === false ? false : undefined,
    bgOverride: output.bgOverride ? output.bgOverride : undefined,
    formatExtra: output.formatExtra === 'none' ? undefined : output.formatExtra,
    gifPaletteSize:
      output.format === 'gif' && output.gifPaletteSize !== 256 ? output.gifPaletteSize : undefined,
    gifQuantizer:
      output.format === 'gif' && output.gifQuantizer !== 'median_cut'
        ? output.gifQuantizer
        : undefined,
    gifDither:
      output.format === 'gif' && output.gifDither !== 'floyd' ? output.gifDither : undefined,
    gifTransparentColor:
      output.format === 'gif' ? output.gifTransparentColor || undefined : undefined,
    svgTrueVector: output.format === 'svg' ? output.svgTrueVector || undefined : undefined,
    svgShapePrecision:
      output.format === 'svg' && output.svgShapePrecision !== 'pixel'
        ? output.svgShapePrecision
        : undefined,
    svgEmbedRasterOverlay:
      output.format === 'svg' && output.svgEmbedRasterOverlay === false ? false : undefined,
  };
}
