import type { OutputLike } from './output-like.type';

export function buildOutputFormatDetails(output: OutputLike) {
  const isGif = output.format === 'gif';
  const isSvg = output.format === 'svg';
  return {
    gifPaletteSize: isGif && output.gifPaletteSize !== 256 ? output.gifPaletteSize : undefined,
    gifQuantizer: isGif && output.gifQuantizer !== 'median_cut' ? output.gifQuantizer : undefined,
    gifDither: isGif && output.gifDither !== 'floyd' ? output.gifDither : undefined,
    gifTransparentColor: isGif ? output.gifTransparentColor || undefined : undefined,
    svgTrueVector: isSvg ? output.svgTrueVector || undefined : undefined,
    svgShapePrecision:
      isSvg && output.svgShapePrecision !== 'pixel' ? output.svgShapePrecision : undefined,
    svgEmbedRasterOverlay: isSvg && output.svgEmbedRasterOverlay === false ? false : undefined,
  };
}
