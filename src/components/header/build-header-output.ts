import type { StoreState } from './store-state.type';

export function buildHeaderOutput(output: StoreState['output']) {
  return {
    width: output.widthPx === 400 ? undefined : output.widthPx,
    height: output.heightPx === 400 ? undefined : output.heightPx,
    format: output.format === 'gif' ? undefined : output.format,
    quality: output.quality === 0.9 ? undefined : output.quality,
    filename: output.filename === 'anqr-qrcode' ? undefined : output.filename,
    dpi: output.dpi === 72 ? undefined : output.dpi,
    includeQuietZone: output.includeQuietZone === false ? false : undefined,
    bgOverride: output.bgOverride || undefined,
    formatExtra: output.formatExtra === 'none' ? undefined : output.formatExtra,
    gifPaletteSize:
      output.format !== 'gif' || output.gifPaletteSize === 256 ? undefined : output.gifPaletteSize,
    gifQuantizer:
      output.format !== 'gif' || output.gifQuantizer === 'median_cut'
        ? undefined
        : output.gifQuantizer,
    gifDither:
      output.format !== 'gif' || output.gifDither === 'floyd' ? undefined : output.gifDither,
    svgTrueVector: output.format === 'svg' && output.svgTrueVector ? true : undefined,
    gifTransparentColor:
      output.format !== 'gif' || !output.gifTransparentColor
        ? undefined
        : output.gifTransparentColor,
    svgShapePrecision:
      output.format !== 'svg' || output.svgShapePrecision === 'pixel'
        ? undefined
        : output.svgShapePrecision,
    svgEmbedRasterOverlay:
      output.format === 'svg' && output.svgEmbedRasterOverlay === false ? false : undefined,
  };
}
