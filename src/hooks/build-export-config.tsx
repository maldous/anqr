export function buildExportConfig<
  O extends {
    format: string;
    widthPx: number;
    heightPx: number;
    quality: number;
    filename: string;
    dpi: number;
    includeQuietZone: boolean;
    bgOverride: string;
    gifPaletteSize: number;
    gifQuantizer: string;
    gifDither: string;
    gifTransparentColor: string;
    gifDisposal: string;
    svgTrueVector: boolean;
    svgShapePrecision: number | string;
    svgEmbedRasterOverlay: boolean;
  },
  M extends {
    title: string;
    author: string;
    copyright: string;
    license: string;
    description: string;
    creationTime: boolean;
    customKv: Array<{ k: string; v: string }>;
  },
>(outputState: O, metadataState: M): Record<string, unknown> {
  return {
    outputFormat: outputState.format,
    outputWidth: outputState.widthPx,
    outputHeight: outputState.heightPx,
    outputQuality: outputState.quality,
    filename: outputState.filename,
    dpi: outputState.dpi,
    includeQuietZone: outputState.includeQuietZone,
    bgOverride: outputState.bgOverride,
    gifPaletteSize: outputState.gifPaletteSize,
    gifQuantizer: outputState.gifQuantizer,
    gifDither: outputState.gifDither,
    gifTransparentColor: outputState.gifTransparentColor,
    gifDisposal: outputState.gifDisposal,
    svgTrueVector: outputState.svgTrueVector,
    svgShapePrecision: outputState.svgShapePrecision,
    svgEmbedRasterOverlay: outputState.svgEmbedRasterOverlay,
    metadata: {
      title: metadataState.title || undefined,
      author: metadataState.author || undefined,
      copyright: metadataState.copyright || undefined,
      license: metadataState.license || undefined,
      description: metadataState.description || undefined,
      creationTime: metadataState.creationTime,
      customKv: metadataState.customKv.filter((kv) => kv.k && kv.v),
    },
  };
}
